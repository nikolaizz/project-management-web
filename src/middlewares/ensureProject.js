import prisma from "../lib/prisma.js";

export async function ensureProject(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID project tidak valid" });
    }

    const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
    }
    next();
  } catch (err) {
    next(err);
  }
}