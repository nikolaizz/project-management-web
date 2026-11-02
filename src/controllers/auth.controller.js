import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const safeUser = ({ passwordHash, authVersion, activationTokenHash, activationExpiresAt, ...user }) => user;
const newActivationToken = () => randomBytes(32).toString("hex");
const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
const tokenMatches = (stored, given) => stored && timingSafeEqual(Buffer.from(stored), Buffer.from(tokenHash(given)));
const expiresAt = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
const issueToken = async (id) => {
  const token = newActivationToken();
  await prisma.user.update({ where: { id }, data: { passwordHash: null, activationTokenHash: tokenHash(token), activationExpiresAt: expiresAt(), authVersion: { increment: 1 } } });
  return token;
};

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { projectManager: { select: { nama: true } }, businessPartner: { select: { nama: true } } },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(String(req.body.password || ""), user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }
    const token = jwt.sign({ ver: user.authVersion }, process.env.JWT_SECRET, { subject: user.id, expiresIn: "8h" });
    res.json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) { next(err); }
}

export function me(req, res) { res.json({ success: true, data: req.user }); }

export async function activateAccount(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, activationTokenHash: true, activationExpiresAt: true } });
    if (!user || !user.activationTokenHash || !user.activationExpiresAt || user.activationExpiresAt <= new Date() || !tokenMatches(user.activationTokenHash, req.body.token)) {
      return res.status(400).json({ success: false, message: "Kode aktivasi tidak valid atau sudah kedaluwarsa" });
    }
    if (Buffer.byteLength(req.body.password) > 72) return res.status(400).json({ success: false, message: "Password maksimal 72 byte" });
    const result = await prisma.user.updateMany({
      where: { id: user.id, activationTokenHash: user.activationTokenHash, activationExpiresAt: { gt: new Date() } },
      data: { passwordHash: await bcrypt.hash(req.body.password, 12), activationTokenHash: null, activationExpiresAt: null, authVersion: { increment: 1 } },
    });
    if (!result.count) return res.status(400).json({ success: false, message: "Kode aktivasi sudah digunakan atau kedaluwarsa" });
    res.json({ success: true, message: "Akun aktif. Silakan login dengan password yang baru dibuat." });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHash: true, authVersion: true } });
    if (!user?.passwordHash || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
      return res.status(400).json({ success: false, message: "Password saat ini salah" });
    }
    if (Buffer.byteLength(req.body.newPassword) > 72) return res.status(400).json({ success: false, message: "Password maksimal 72 byte" });
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await bcrypt.hash(req.body.newPassword, 12), authVersion: { increment: 1 } }, select: { authVersion: true } });
    const token = jwt.sign({ ver: updated.authVersion }, process.env.JWT_SECRET, { subject: req.user.id, expiresIn: "8h" });
    res.json({ success: true, message: "Password berhasil diganti", data: { token } });
  } catch (err) { next(err); }
}

export async function listUsers(req, res, next) {
  try {
    const data = await prisma.user.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, email: true, role: true, passwordHash: true, projectManagerId: true, businessPartnerId: true,
        projectManager: { select: { nama: true } }, businessPartner: { select: { nama: true } } },
    });
    res.json({ success: true, data: data.map(({ passwordHash, ...user }) => ({ ...user, activated: Boolean(passwordHash) })) });
  } catch (err) { next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { nama, email, role, projectManagerId, businessPartnerId } = req.body;
    if ((role === "PROJECT_MANAGER" && (!projectManagerId || businessPartnerId)) ||
        (role === "BUSINESS_PARTNER" && (!businessPartnerId || projectManagerId)) ||
        (!['PROJECT_MANAGER', 'BUSINESS_PARTNER'].includes(role) && (projectManagerId || businessPartnerId))) {
      return res.status(400).json({ success: false, message: "Profil harus sesuai dengan role" });
    }
    const profile = role === "PROJECT_MANAGER" ? await prisma.projectManager.findUnique({ where: { id: projectManagerId } }) :
      role === "BUSINESS_PARTNER" ? await prisma.businessPartner.findUnique({ where: { id: businessPartnerId } }) : true;
    if (!profile) return res.status(400).json({ success: false, message: "Data PM/BP tidak ditemukan" });
    const activationToken = newActivationToken();
    const data = await prisma.user.create({
      data: { id: `USER-${randomUUID()}`, nama: nama.trim(), email: email.trim().toLowerCase(), role, activationTokenHash: tokenHash(activationToken), activationExpiresAt: expiresAt(), projectManagerId: projectManagerId || null, businessPartnerId: businessPartnerId || null },
      select: { id: true, nama: true, email: true, role: true, projectManagerId: true, businessPartnerId: true },
    });
    res.status(201).json({ success: true, message: "Akun dibuat. Bagikan kode aktivasi kepada pengguna.", data: { ...data, activationToken } });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Email atau profil sudah terhubung ke akun lain" });
    next(err);
  }
}

export async function reissueActivation(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan" });
    const activationToken = await issueToken(user.id);
    res.json({ success: true, message: "Kode baru terbit. Password lama dinonaktifkan.", data: { activationToken } });
  } catch (err) { next(err); }
}
