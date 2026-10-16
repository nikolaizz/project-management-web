import prisma from "../lib/prisma.js";
import { STATUS, KATEGORI } from "../constants/enums.js";

// Relasi data master yang ikut dikirim bersama project, tanpa mengambil kolom lain.
const projectInclude = {
  pm: { select: { id: true, nama: true } },
  bp: { select: { id: true, nama: true } },
  unitPengusul: { select: { id: true, nama: true } },
};

// ---------- GET /projects ----------
export async function getProjects(req, res, next) {
  try {
    // Ambil filter dan pagination dari query URL; batasi jumlah hasil maksimal 100.
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { search, status, kategori, unitId } = req.query;

    // Tolak filter yang tidak termasuk pilihan resmi sebelum menjalankan query database.
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

    // Bangun kondisi pencarian hanya dari filter yang benar-benar dikirim pemanggil.
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

    // Jalankan query daftar dan hitung total secara bersamaan agar pagination akurat.
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          ...projectInclude,
          // Daftar hanya menyertakan update terbaru dan jumlah dokumen/update.
          updates: { orderBy: { tanggalInput: "desc" }, take: 1 },
          _count: { select: { documents: true, updates: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Sertakan informasi pagination agar klien tahu jumlah halaman yang tersedia.
    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    // Biarkan middleware error mengubah error database menjadi respons HTTP.
    next(err);
  }
}

// ---------- GET /projects/check-code?kode=HCMS-001 ----------
export async function checkProjectCode(req, res, next) {
  try {
    // Rapikan kode dari query sebelum mencari kecocokan persis di database.
    const kode = (req.query.kode || "").trim();
    if (!kode) {
      return res
        .status(400)
        .json({ success: false, message: "Parameter 'kode' wajib diisi" });
    }

    const project = await prisma.project.findUnique({
      where: { kodeProject: kode },
      include: projectInclude,
    });

    res.json({
      success: true,
      data: { exists: Boolean(project), project },
    });
  } catch (err) {
    next(err);
  }
}

// ---------- GET /projects/:id ----------
export async function getProjectById(req, res, next) {
  try {
    // Parameter URL berupa teks, jadi ubah menjadi angka dan validasi hasilnya.
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID project tidak valid" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ...projectInclude,
        // Pada tampilan detail, ambil seluruh dokumen dan riwayat update terbaru dahulu.
        documents: { orderBy: { uploadedAt: "desc" } },
        updates: { orderBy: { tanggalInput: "desc" } },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

// ---------- POST /projects ----------
export async function createProject(req, res, next) {
  try {
    // Body sudah diperiksa dan dibersihkan oleh middleware validate sebelum masuk ke sini.
    const d = req.body; // sudah divalidasi oleh middleware validate()

    // Cek kode unik supaya pesan errornya ramah
    if (d.kodeProject) {
      const exists = await prisma.project.findUnique({
        where: { kodeProject: d.kodeProject },
      });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: `Kode project ${d.kodeProject} sudah digunakan`,
        });
      }
    }

    // Ubah tanggal teks dari request menjadi Date sebelum disimpan oleh Prisma.
    const project = await prisma.project.create({
      data: {
        kategori: d.kategori,
        jenis: d.jenis,
        kodeProject: d.kodeProject,
        nama: d.nama,
        deskripsi: d.deskripsi,
        pmId: d.pmId,
        bpId: d.bpId,
        unitId: d.unitId,
        ownerPic: d.ownerPic,
        tanggalProject: new Date(d.tanggalProject),
        targetGoLive: d.targetGoLive ? new Date(d.targetGoLive) : null,
        status: d.status,
      },
      include: projectInclude,
    });

    // Status 201 menandakan resource baru berhasil dibuat.
    res.status(201).json({
      success: true,
      message: "Project berhasil dibuat",
      data: project,
    });
  } catch (err) {
    next(err);
  }
}