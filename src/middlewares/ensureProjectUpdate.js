import prisma from "../lib/prisma.js";

export async function ensureProjectUpdate(req, res, next) {
  const projectId = Number(req.params.id);
  const updateId = Number(req.params.updateId);
  if (!Number.isInteger(projectId) || !Number.isInteger(updateId)) {
    return res.status(400).json({ success: false, message: "ID project atau update tidak valid" });
  }

  try {
    const update = await prisma.projectUpdate.findFirst({
      where: { id: updateId, projectId },
      select: { id: true },
    });
    if (!update) {
      return res.status(404).json({ success: false, message: "Update tidak ditemukan pada project ini" });
    }
    next();
  } catch (err) {
    next(err);
  }
}
