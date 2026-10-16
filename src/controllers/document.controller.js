import path from "node:path";
import { existsSync } from "node:fs";
import prisma from "../lib/prisma.js";
import { UPLOAD_DIR, removeFiles } from "../lib/files.js";

// ---------- POST /projects/:id/documents ----------
export async function uploadDocuments(req, res, next) {
  const files = req.files || [];
  try {
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah. Kirim sebagai form-data dengan nama field 'files'",
      });
    }

    const projectId = Number(req.params.id);

    // Semua tersimpan, atau tidak sama sekali
    const created = await prisma.$transaction(
      files.map((f) =>
        prisma.document.create({
          data: {
            projectId,
            namaFile: f.originalname,
            pathFile: f.filename,
            ukuran: f.size,
            tipe: f.mimetype,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${created.length} dokumen berhasil diunggah`,
      data: created,
    });
  } catch (err) {
    // Kalau database gagal, jangan tinggalkan file yatim di disk
    await removeFiles(files.map((f) => f.filename));
    next(err);
  }
}

// ---------- GET /projects/:id/documents ----------
export async function listDocuments(req, res, next) {
  try {
    const data = await prisma.document.findMany({
      where: { projectId: Number(req.params.id) },
      orderBy: { uploadedAt: "desc" },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ---------- GET /documents/:id/download ----------
export async function downloadDocument(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID dokumen tidak valid" });
    }

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });
    }

    const fullPath = path.join(UPLOAD_DIR, doc.pathFile);
    if (!existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: "File fisik tidak ditemukan di server" });
    }

    res.download(fullPath, doc.namaFile); // diunduh dengan nama aslinya
  } catch (err) {
    next(err);
  }
}

// ---------- DELETE /documents/:id ----------
export async function deleteDocument(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID dokumen tidak valid" });
    }

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });
    }

    await prisma.document.delete({ where: { id } });
    await removeFiles([doc.pathFile]);

    res.json({ success: true, message: "Dokumen berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}