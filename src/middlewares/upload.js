import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOAD_DIR } from "../lib/files.js";

const ALLOWED_EXT = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // Nama di disk diacak supaya tidak bentrok dan aman.
  // Nama asli disimpan di database (kolom namaFile).
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    const err = new Error(
      `Tipe file ${ext || "(tanpa ekstensi)"} tidak diizinkan. Diizinkan: ${ALLOWED_EXT.join(", ")}`
    );
    err.code = "INVALID_FILE_TYPE";
    return cb(err);
  }
  cb(null, true);
};

// Field di form-data harus bernama "files", maksimal 10 file
export const uploadFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 10 },
}).array("files", 10);