import "dotenv/config";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import { demoActors, demoProjects } from "../prisma/demo-fixture.js";

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const databaseUrl = new URL(process.env.DATABASE_URL || "");
if (process.env.NODE_ENV === "production" || !localHosts.has(databaseUrl.hostname)) {
  throw new Error("Seed demo hanya boleh dijalankan pada database lokal non-production.");
}

const names = new Set(demoProjects.map(({ nama }) => nama));
assert.equal(names.size, 8, "Fixture demo harus berisi tepat delapan project unik.");
assert.equal(demoProjects.reduce((sum, project) => sum + project.updates.length, 0), 40, "Fixture demo harus berisi 40 riwayat update.");
for (const project of demoProjects) {
  assert.equal(project.updates.length, 5, `${project.nama} harus memiliki lima update.`);
  for (const update of project.updates) {
    assert.ok([project.pm, project.bp].includes(update.updatedBy), `Pencatat update ${project.nama} harus PM atau BP project tersebut.`);
    assert.ok(![0, 6].includes(new Date(`${update.date}T00:00:00Z`).getUTCDay()), `Update ${project.nama} tidak boleh jatuh pada akhir pekan.`);
  }
}

const asDate = (date) => date ? new Date(`${date}T00:00:00.000Z`) : null;
const asDateTime = (dateTime) => new Date(dateTime);
const updateDateTime = (update) => asDateTime(`${update.date}T${update.time}:00+07:00`);
const idPart = (value) => value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");

async function getOrCreateMaster(tx, model, id, nama) {
  const existing = await tx[model].findUnique({ where: { nama } });
  if (existing) return existing;
  const occupiedId = await tx[model].findUnique({ where: { id } });
  if (occupiedId) throw new Error(`ID data master ${id} sudah dipakai oleh ${occupiedId.nama}.`);
  return tx[model].create({ data: { id, nama } });
}

async function getOrCreateUnit(tx, nama) {
  return (await tx.unit.findUnique({ where: { nama } })) ?? tx.unit.create({ data: { nama } });
}

async function getOrCreateActor(tx, nama, { role, email }) {
  const matches = await tx.user.findMany({ where: { nama }, select: { id: true, role: true } });
  if (matches.length > 1) throw new Error(`Ada lebih dari satu akun bernama ${nama}; seed demo dibatalkan.`);
  if (matches.length === 1) {
    if (matches[0].role !== role) throw new Error(`Role akun ${nama} berbeda dari role pencatat demo.`);
    return matches[0].id;
  }

  const byEmail = await tx.user.findUnique({ where: { email }, select: { id: true, nama: true, role: true } });
  if (byEmail) {
    if (byEmail.nama !== nama || byEmail.role !== role) throw new Error(`Email placeholder untuk ${nama} sudah dipakai.`);
    return byEmail.id;
  }
  const id = `USER-DEMO-${role === "PROJECT_MANAGER" ? "PM" : "BP"}-${idPart(nama)}`;
  return (await tx.user.create({ data: { id, nama, email, role } })).id;
}

async function main() {
  await prisma.$transaction(async (tx) => {
    const existingProjects = await tx.project.findMany({ select: { id: true, nama: true } });
    const nameCounts = new Map();
    for (const project of existingProjects) nameCounts.set(project.nama, (nameCounts.get(project.nama) || 0) + 1);
    const unknown = existingProjects.filter(({ nama }) => !names.has(nama));
    if (unknown.length || [...nameCounts.values()].some((count) => count > 1)) {
      throw new Error("Database berisi project di luar fixture demo atau nama project duplikat. Tidak ada data yang diubah.");
    }

    const pmIds = new Map();
    const bpIds = new Map();
    const unitIds = new Map();
    for (const [id, nama] of [["PM-001", "Budi Santoso"], ["PM-002", "Dewi Lestari"], ["PM-003", "Nikola Izzan"]]) {
      pmIds.set(nama, (await getOrCreateMaster(tx, "projectManager", id, nama)).id);
    }
    for (const [id, nama] of [["BP-001", "Rizky Aditya"], ["BP-002", "Sari Wulandari"]]) {
      bpIds.set(nama, (await getOrCreateMaster(tx, "businessPartner", id, nama)).id);
    }
    for (const nama of ["HCE", "HCS", "STA", "AML"]) unitIds.set(nama, (await getOrCreateUnit(tx, nama)).id);

    const actorIds = new Map();
    for (const [nama, account] of Object.entries(demoActors)) actorIds.set(nama, await getOrCreateActor(tx, nama, account));
    const optionalStageActors = new Map();
    const nikola = await tx.user.findMany({ where: { nama: "Nikola" }, select: { id: true } });
    if (nikola.length === 1) optionalStageActors.set("Nikola", nikola[0].id);

    for (const project of demoProjects) {
      const existing = existingProjects.find(({ nama }) => nama === project.nama);
      const lastUpdate = project.updates.at(-1);
      const data = {
        kategori: project.kategori,
        jenis: project.jenis,
        kodeProject: project.kodeProject,
        nama: project.nama,
        deskripsi: project.deskripsi,
        pmId: pmIds.get(project.pm),
        bpId: bpIds.get(project.bp),
        unitId: unitIds.get(project.unit),
        unitKerjaDeveloper: project.unitKerjaDeveloper,
        ownerPic: project.ownerPic,
        tanggalProject: asDate(project.tanggalProject),
        targetGoLive: asDate(project.targetGoLive),
        status: project.status,
        prioritas: project.prioritas,
        createdAt: asDateTime(project.createdAt),
        updatedAt: updateDateTime(lastUpdate),
      };
      const saved = existing
        ? await tx.project.update({ where: { id: existing.id }, data })
        : await tx.project.create({ data });

      await tx.projectUpdate.deleteMany({ where: { projectId: saved.id } });
      await tx.projectStage.deleteMany({ where: { projectId: saved.id } });
      await tx.projectStageHistory.deleteMany({ where: { projectId: saved.id } });
      await tx.projectStage.createMany({ data: project.stages.map((item) => ({
        projectId: saved.id,
        tahap: item.tahap,
        status: item.status,
        tanggalRencana: asDate(item.tanggalRencana),
        catatan: item.catatan,
      })) });
      if (project.stageHistory.length) {
        await tx.projectStageHistory.createMany({ data: project.stageHistory.map((item) => ({
          projectId: saved.id,
          tahap: item.tahap,
          changedAt: asDateTime(item.changedAt),
          status: item.status,
          tanggalRencana: asDate(item.tanggalRencana),
          catatan: item.catatan,
          modifiedById: item.updatedBy ? (actorIds.get(item.updatedBy) ?? optionalStageActors.get(item.updatedBy) ?? null) : null,
        })) });
      }
      await tx.projectUpdate.createMany({ data: project.updates.map((item) => ({
        projectId: saved.id,
        tanggal: asDate(item.date),
        tanggalInput: updateDateTime(item),
        status: item.status,
        aktivitas: item.aktivitas,
        kendala: item.kendala,
        nextAction: item.nextAction,
        modifiedById: actorIds.get(item.updatedBy),
      })) });
    }

    await tx.dashboardAiSummary.deleteMany();
    assert.equal(await tx.project.count(), 8, "Seed demo harus menghasilkan tepat delapan project.");
    assert.equal(await tx.projectUpdate.count(), 40, "Seed demo harus menghasilkan tepat 40 riwayat update.");
    assert.equal(await tx.projectUpdate.count({ where: { modifiedById: null } }), 0, "Semua update demo harus memiliki pencatat.");
  });

  console.log("Data demo dipulihkan: 8 project, 40 riwayat update. Akun login dan dokumen yang ada dipertahankan; AI Summary tersimpan dihapus.");
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
