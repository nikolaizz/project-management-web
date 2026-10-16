export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

// Express mengenali error handler dari jumlah parameternya (harus 4)
export function errorHandler(err, req, res, next) {
  // Body JSON rusak (misal koma berlebih)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Format JSON tidak valid" });
  }
  // Prisma: data unik bentrok
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, message: "Data duplikat" });
  }
  // Prisma: foreign key tidak ada (misal pmId salah)
  if (err.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "Data referensi (PM / BP / Unit) tidak ditemukan",
    });
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
}