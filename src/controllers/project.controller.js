import prisma from "../lib/prisma.js";

const STATUS = ["DRAFT", "INISIASI", "ON_PROGRESS", "PENDING", "ON_HOLD", "SELESAI"];
const KATEGORI = ["FS", "CR_FORM", "AIR_FORM", "IC_FORM", "SC_FORM"];

export async function getProjects(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { search, status, kategori, unitId } = req.query;

    // Validasi filter enum supaya tidak error 500
    if (status && !STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan: ${STATUS.join(", ")}`,
      });
    }
    if (kategori && !KATEGORI.includes(kategori)) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak valid. Pilihan: ${KATEGORI.join(", ")}`,
      });
    }

    // Susun filter secara dinamis
    const where = {};
    if (status) where.status = status;
    if (kategori) where.kategori = kategori;
    if (unitId) where.unitId = parseInt(unitId);
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { kodeProject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          pm: { select: { id: true, nama: true } },
          bp: { select: { id: true, nama: true } },
          unitPengusul: { select: { id: true, nama: true } },
          updates: { orderBy: { tanggalInput: "desc" }, take: 1 }, // update terakhir
          _count: { select: { documents: true, updates: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
}