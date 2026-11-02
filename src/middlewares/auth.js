import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export async function authenticate(req, res, next) {
  let sub, ver;
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ success: false, message: "Silakan login terlebih dahulu" });
    ({ sub, ver } = jwt.verify(token, process.env.JWT_SECRET));
  } catch {
    return res.status(401).json({ success: false, message: "Sesi tidak berlaku. Silakan login kembali" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, nama: true, email: true, role: true, authVersion: true, projectManagerId: true, businessPartnerId: true,
        projectManager: { select: { nama: true } }, businessPartner: { select: { nama: true } } },
    });
    if (!user || user.authVersion !== ver) return res.status(401).json({ success: false, message: "Sesi tidak berlaku. Silakan login kembali" });
    delete user.authVersion;
    req.user = user;
    next();
  } catch (err) { next(err); }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ success: false, message: "Anda tidak memiliki akses untuk tindakan ini" });

export const canEditProject = (user, project) => user?.role === "ADMIN" ||
  (user?.role === "PROJECT_MANAGER" && user.projectManagerId === project.pmId) ||
  (user?.role === "BUSINESS_PARTNER" && user.businessPartnerId === project.bpId);

export async function authorizeProject(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: "ID project tidak valid" });
    const project = await prisma.project.findUnique({ where: { id }, select: { id: true, pmId: true, bpId: true } });
    if (!project) return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
    if (!canEditProject(req.user, project)) return res.status(403).json({ success: false, message: "Anda tidak dapat mengubah project ini" });
    req.project = project;
    next();
  } catch (err) { next(err); }
}
