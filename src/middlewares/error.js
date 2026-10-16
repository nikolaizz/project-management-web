export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Format JSON tidak valid" });
  }

  // Error upload
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Ukuran file maksimal 10 MB" });
  }
  if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Gunakan field bernama 'files' dan maksimal 10 file per upload",
    });
  }
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: `Upload gagal: ${err.message}` });
  }

  // Error Prisma
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, message: "Data duplikat" });
  }
  if (err.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "Data referensi (PM / BP / Unit) tidak ditemukan",
    });
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
}