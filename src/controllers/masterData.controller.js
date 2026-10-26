import prisma from "../lib/prisma.js";

// Kode berurutan untuk master ber-id teks: PM-001, PM-002, ...
async function nextCode(model, prefix) {
  const rows = await prisma[model].findMany({
    where: { id: { startsWith: `${prefix}-` } },
    select: { id: true },
  });
  const max = rows.reduce(
    (m, r) => Math.max(m, parseInt(r.id.slice(prefix.length + 1), 10) || 0),
    0
  );
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

// prefix terisi -> id berupa teks (PM-001). prefix kosong -> id angka otomatis (Unit).
function makeCrud({ model, label, fk, prefix = null }) {
  const parseId = (raw) => (prefix ? String(raw) : Number(raw));
  const validId = (id) => (prefix ? id.length > 0 : Number.isInteger(id));

  // Cek nama kembar tanpa membedakan huruf besar/kecil
  const duplicate = (nama, exceptId) =>
    prisma[model].findFirst({
      where: {
        nama: { equals: nama, mode: "insensitive" },
        ...(exceptId !== undefined ? { NOT: { id: exceptId } } : {}),
      },
    });

  const badId = (res) =>
    res.status(400).json({ success: false, message: `ID ${label} tidak valid` });

  return {
    // GET: daftar beserta jumlah project yang memakainya
    async list(req, res, next) {
      try {
        const data = await prisma[model].findMany({
          orderBy: { nama: "asc" },
          include: { _count: { select: { projects: true } } },
        });
        res.json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },

    // POST: tambah data baru
    async create(req, res, next) {
      try {
        const { nama } = req.body;
        if (await duplicate(nama)) {
          return res.status(409).json({ success: false, message: `${label} "${nama}" sudah ada` });
        }
        const data = { nama };
        if (prefix) data.id = await nextCode(model, prefix);

        const row = await prisma[model].create({ data });
        res.status(201).json({ success: true, message: `${label} berhasil ditambahkan`, data: row });
      } catch (err) {
        next(err);
      }
    },

    // PUT: ubah nama
    async update(req, res, next) {
      try {
        const id = parseId(req.params.id);
        if (!validId(id)) return badId(res);

        const existing = await prisma[model].findUnique({ where: { id } });
        if (!existing) {
          return res.status(404).json({ success: false, message: `${label} tidak ditemukan` });
        }
        if (await duplicate(req.body.nama, id)) {
          return res.status(409).json({ success: false, message: `${label} "${req.body.nama}" sudah ada` });
        }

        const row = await prisma[model].update({ where: { id }, data: { nama: req.body.nama } });
        res.json({ success: true, message: `${label} berhasil diubah`, data: row });
      } catch (err) {
        next(err);
      }
    },

    // DELETE: hapus, ditolak kalau masih dipakai project
    async remove(req, res, next) {
      try {
        const id = parseId(req.params.id);
        if (!validId(id)) return badId(res);

        const existing = await prisma[model].findUnique({ where: { id } });
        if (!existing) {
          return res.status(404).json({ success: false, message: `${label} tidak ditemukan` });
        }
        const used = await prisma.project.count({ where: { [fk]: id } });
        if (used > 0) {
          return res.status(409).json({
            success: false,
            message: `${label} "${existing.nama}" tidak bisa dihapus karena masih dipakai oleh ${used} project`,
          });
        }

        await prisma[model].delete({ where: { id } });
        res.json({ success: true, message: `${label} berhasil dihapus` });
      } catch (err) {
        next(err);
      }
    },
  };
}

export const projectManagers = makeCrud({ model: "projectManager", label: "Project Manager", fk: "pmId", prefix: "PM" });
export const businessPartners = makeCrud({ model: "businessPartner", label: "Business Partner", fk: "bpId", prefix: "BP" });
export const units = makeCrud({ model: "unit", label: "Unit pengusul", fk: "unitId" });