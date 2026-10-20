import path from "node:path";
import { existsSync } from "node:fs";
import prisma from "../lib/prisma.js";
import { UPLOAD_DIR, removeFiles } from "../lib/files.js";

const updateInclude = {
  documents: { orderBy: { uploadedAt: "desc" } },
};

export async function createProjectUpdate(req, res, next) {
  try {
    const projectId = Number(req.params.id);
    const update = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: { status: req.body.status },
      });
      return tx.projectUpdate.create({
        data: { projectId, ...req.body, kendala: req.body.kendala || null },
        include: updateInclude,
      });
    });

    res.status(201).json({ success: true, message: "Update project berhasil disimpan", data: update });
  } catch (err) {
    next(err);
  }
}

export async function listProjectUpdates(req, res, next) {
  try {
    const data = await prisma.projectUpdate.findMany({
      where: { projectId: Number(req.params.id) },
      include: updateInclude,
      orderBy: { tanggalInput: "desc" },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function uploadUpdateDocuments(req, res, next) {
  const files = req.files || [];
  try {
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah. Kirim sebagai form-data dengan nama field 'files'",
      });
    }

    const updateId = Number(req.params.updateId);
    const created = await prisma.$transaction(
      files.map((file) =>
        prisma.updateDocument.create({
          data: {
            updateId,
            namaFile: file.originalname,
            pathFile: file.filename,
            ukuran: file.size,
            tipe: file.mimetype,
          },
        })
      )
    );
    res.status(201).json({ success: true, message: `${created.length} dokumen berhasil diunggah`, data: created });
  } catch (err) {
    await removeFiles(files.map((file) => file.filename));
    next(err);
  }
}

export async function downloadUpdateDocument(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID dokumen tidak valid" });
    }

    const doc = await prisma.updateDocument.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Dokumen update tidak ditemukan" });
    }

    const fullPath = path.join(UPLOAD_DIR, doc.pathFile);
    if (!existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: "File fisik tidak ditemukan di server" });
    }
    res.download(fullPath, doc.namaFile);
  } catch (err) {
    next(err);
  }
}
