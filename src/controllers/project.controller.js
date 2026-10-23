import prisma from "../lib/prisma.js";
import { STATUS, KATEGORI, PRIORITAS} from "../constants/enums.js";
import { removeFiles } from "../lib/files.js";
import { buildStages } from "../lib/stages.js";

// Relasi data master yang ikut dikirim bersama project, tanpa mengambil kolom lain.
const projectInclude = {
  pm: { select: { id: true, nama: true } },
  bp: { select: { id: true, nama: true } },
  unitPengusul: { select: { id: true, nama: true } },
  stages: { orderBy: { tahap: "asc" } },
};

// ---------- GET /projects ----------
export async function getProjects(req, res, next) {
  try {
    // Ambil filter dan pagination dari query URL; batasi jumlah hasil maksimal 100.
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { search, status, kategori, unitId, prioritas } = req.query;

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
    // BARU: validasi filter prioritas
    if (prioritas && !PRIORITAS.includes(prioritas)) {
      return res.status(400).json({
        success: false,
        message: `Prioritas tidak valid. Pilihan: ${PRIORITAS.join(", ")}`,
      });
    }

    // Bangun kondisi pencarian hanya dari filter yang benar-benar dikirim pemanggil.
    const where = {};
    if (status) where.status = status;
    if (kategori) where.kategori = kategori;
    if (prioritas) where.prioritas = prioritas; // BARU: filter prioritas
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
        updates: { orderBy: { tanggalInput: "desc" }, include : { modifiedBy: { select: { id: true, nama: true } } } },
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
        kodeProject: d.kodeProject || null, // "" / null / kosong dinormalisasi menjadi null
        nama: d.nama,
        deskripsi: d.deskripsi,
        pmId: d.pmId,
        bpId: d.bpId,
        unitId: d.unitId,
        ownerPic: d.ownerPic,
        tanggalProject: new Date(d.tanggalProject),
        targetGoLive: d.targetGoLive ? new Date(d.targetGoLive) : null,
        status: d.status,
        prioritas: d.prioritas,
        stages: {
          create: buildStages(d.stages),
        },
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

// ---------- PUT /projects/:id ----------
export async function updateProject(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID project tidak valid" });
    }

    const d = req.body; // sudah divalidasi (semua field opsional)
    if (Object.keys(d).length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang diubah" });
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
    }

    // Hitung nilai akhir untuk aturan bisnis
    const jenis = d.jenis ?? existing.jenis;
    const kode = "kodeProject" in d ? d.kodeProject || null : existing.kodeProject;

    if (jenis === "ADDENDUM" && !kode) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: [{ field: "kodeProject", message: "Kode project wajib diisi untuk jenis Addendum" }],
      });
    }

    // Kode harus unik (selain milik project ini sendiri)
    if (kode && kode !== existing.kodeProject) {
      const dup = await prisma.project.findUnique({ where: { kodeProject: kode } });
      if (dup) {
        return res.status(409).json({
          success: false,
          message: `Kode project ${kode} sudah digunakan`,
        });
      }
    }

    // Hanya ubah field yang memang dikirim
    const data = {};
    for (const key of ["kategori", "jenis", "nama", "deskripsi", "pmId", "bpId", "unitId", "ownerPic", "prioritas"]) {
      if (key in d) data[key] = d[key];
    }
    if ("kodeProject" in d) data.kodeProject = kode;
    if ("tanggalProject" in d) data.tanggalProject = new Date(d.tanggalProject);
    if ("targetGoLive" in d) data.targetGoLive = d.targetGoLive ? new Date(d.targetGoLive) : null;
    if ("status" in d) data.status = d.status;

    const statusChanged = d.status !== undefined && d.status !== existing.status;
    const project = await prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id },
        data,
        include: projectInclude,
      });

      if (statusChanged) {
        await tx.projectUpdate.create({
          data: {
            projectId: id,
            status: d.status,
            aktivitas: d.aktivitas,
            kendala: d.kendala || null,
            nextAction: d.nextAction,
            modifiedById: req.user.id 
          },
        });
      }

      return updated;
    });

    res.json({ success: true, message: "Project berhasil diperbarui", data: project });
  } catch (err) {
    next(err);
  }
}

// ---------- DELETE /projects/:id ----------
export async function deleteProject(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID project tidak valid" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { documents: { select: { pathFile: true } } },
    });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
    }

    // Baris dokumen dan update ikut terhapus otomatis (onDelete: Cascade di schema)
    await prisma.project.delete({ where: { id } });
    // File fisiknya kita hapus manual
    await removeFiles(project.documents.map((doc) => doc.pathFile));

    res.json({ success: true, message: "Project berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}

// ---------- PUT /projects/:id/stages ----------
export async function updateStages(req, res, next) {
  try {
    const projectId = Number(req.params.id);
    const { stages } = req.body; // sudah divalidasi

    // Semua tahapan diperbarui, atau tidak sama sekali
    await prisma.$transaction(
      stages.map((s) => {
        // Hanya ubah field yang memang dikirim
        const data = {};
        if (s.tanggalRencana !== undefined) {
          data.tanggalRencana = s.tanggalRencana ? new Date(s.tanggalRencana) : null;
        }
        if (s.status !== undefined) data.status = s.status;
        if (s.catatan !== undefined) data.catatan = s.catatan || null;

        // upsert: ubah kalau barisnya ada, buat kalau belum
        // (berguna untuk project lama yang dibuat sebelum fitur ini)
        return prisma.projectStage.upsert({
          where: { projectId_tahap: { projectId, tahap: s.tahap } },
          update: data,
          create: {
            projectId,
            tahap: s.tahap,
            tanggalRencana: data.tanggalRencana ?? null,
            status: data.status ?? "PLANNED",
            catatan: data.catatan ?? null,
          },
        });
      })
    );

    const result = await prisma.projectStage.findMany({
      where: { projectId },
      orderBy: { tahap: "asc" },
    });

    res.json({ success: true, message: "Tahapan berhasil diperbarui", data: result });
  } catch (err) {
    next(err);
  }
}