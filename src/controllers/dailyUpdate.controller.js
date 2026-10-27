import prisma from "../lib/prisma.js";
import { buildWhatsAppText } from "../lib/whatsapp.js";
import { todayWIB } from "../lib/dates.js";

// ---------- POST /daily-updates ----------
export async function createDailyUpdates(req, res, next) {
  try {
    const { items } = req.body; // sudah divalidasi

    // Pastikan semua project ada sebelum menyimpan apa pun
    const ids = items.map((i) => i.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: ids } },
      include: { pm: { select: { nama: true } }, bp: { select: { nama: true } } },
    });
    const byId = new Map(projects.map((p) => [p.id, p]));
    const hilang = ids.filter((id) => !byId.has(id));
    if (hilang.length) {
      return res.status(404).json({
        success: false,
        message: `Project tidak ditemukan: ID ${hilang.join(", ")}`,
      });
    }

    const tanggal = todayWIB(); // "YYYY-MM-DD" menurut WIB

    // Semua project tersimpan, atau tidak sama sekali
    const rows = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const it of items) {
        const p = byId.get(it.projectId);
        const status = it.status ?? p.status;

        // Status project ikut diperbarui kalau diubah di sini
        if (status !== p.status) {
          await tx.project.update({ where: { id: p.id }, data: { status } });
        }

        created.push(
          await tx.dailyUpdate.create({
            data: {
              projectId: p.id,
              tanggal: new Date(tanggal),
              status,
              aktivitas: it.aktivitas,
              kendala: it.kendala || null,
              nextAction: it.nextAction,
              updatedById: req.user?.id ?? null, // terisi setelah login ada
            },
          })
        );
      }
      return created;
    });

    const text = buildWhatsAppText(
      items.map((it) => {
        const p = byId.get(it.projectId);
        return {
          nama: p.nama,
          status: it.status ?? p.status,
          prioritas: p.prioritas,
          pmNama: p.pm.nama,
          bpNama: p.bp.nama,
          ownerPic: p.ownerPic,
          targetGoLive: p.targetGoLive,
          aktivitas: it.aktivitas,
          kendala: it.kendala,
          nextAction: it.nextAction,
        };
      }),
      tanggal
    );

    res.status(201).json({
      success: true,
      message: `${rows.length} update berhasil disimpan`,
      data: rows,
      text,
    });
  } catch (err) {
    next(err);
  }
}

// ---------- GET /daily-updates?projectId=1&limit=10 ----------
export async function listDailyUpdates(req, res, next) {
  try {
    const projectId = Number(req.query.projectId);
    if (!Number.isInteger(projectId)) {
      return res.status(400).json({ success: false, message: "Parameter 'projectId' wajib diisi" });
    }
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const data = await prisma.dailyUpdate.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { updatedBy: { select: { id: true, nama: true } } },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}