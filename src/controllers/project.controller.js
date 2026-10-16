import prisma from "../lib/prisma.js";
import { STATUS, KATEGORI } from "../constants/enums.js";

// Relasi yang selalu disertakan di response
const projectInclude = {
  pm: { select: { id: true, nama: true } },
  bp: { select: { id: true, nama: true } },
  unitPengusul: { select: { id: true, nama: true } },
};

// ---------- GET /projects ----------
export async function getProjects(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { search, status, kategori, unitId } = req.query;

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
          ...projectInclude,
          updates: { orderBy: { tanggalInput: "desc" }, take: 1 },
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
    next(err);
  }
}

// ---------- GET /projects/check-code?kode=HCMS-001 ----------
export async function checkProjectCode(req, res, next) {
  try {
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
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID project tidak valid" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ...projectInclude,
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

    res.status(201).json({
      success: true,
      message: "Project berhasil dibuat",
      data: project,
    });
  } catch (err) {
    next(err);
  }
}