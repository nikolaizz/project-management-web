// Membuat middleware validasi untuk schema tertentu, misalnya schema pembuatan project.
export const validate = (schema) => (req, res, next) => {
  // safeParse memeriksa body tanpa melempar error jika input tidak sesuai.
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Kembalikan daftar kesalahan dengan nama field agar mudah diperbaiki oleh klien.
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Ganti body dengan hasil yang sudah divalidasi dan dinormalisasi oleh schema.
  req.body = result.data; // pakai data yang sudah dibersihkan
  // Lanjutkan ke handler route berikutnya setelah validasi berhasil.
  next();
};