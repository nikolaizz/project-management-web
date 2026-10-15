import prisma from "../src/lib/prisma.js";

async function main() {
  // Bersihkan data lama (anak dulu, baru induk)
  await prisma.document.deleteMany();
  await prisma.projectUpdate.deleteMany();
  await prisma.project.deleteMany();
  await prisma.projectManager.deleteMany();
  await prisma.businessPartner.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      nama: "Riswan Saputra",
      email: "riswan@example.com",
      passwordHash: "dummy-nanti-diganti-hash",
      role: "PROJECT_MANAGER",
    },
  });

  // Master data untuk dropdown
  const [budi, dewi] = await Promise.all([
    prisma.projectManager.create({ data: { nama: "Budi Santoso" } }),
    prisma.projectManager.create({ data: { nama: "Dewi Lestari" } }),
  ]);
  const [rizky, sari] = await Promise.all([
    prisma.businessPartner.create({ data: { nama: "Rizky Aditya" } }),
    prisma.businessPartner.create({ data: { nama: "Sari Wulandari" } }),
  ]);
  const [hcs, its] = await Promise.all([
    prisma.unit.create({ data: { nama: "HCS" } }),
    prisma.unit.create({ data: { nama: "ITS" } }),
  ]);

  // Project dummy
  const hcms = await prisma.project.create({
    data: {
      kategori: "FS",
      jenis: "NEW",
      kodeProject: "HCMS-001",
      nama: "Upgrade HCMS Core",
      deskripsi: "Upgrade aplikasi HCMS Core untuk meningkatkan performa dan keamanan sistem.",
      pmId: budi.id,
      bpId: rizky.id,
      unitId: hcs.id,
      ownerPic: "Budi Santoso",
      tanggalProject: new Date("2026-09-01"),
      targetGoLive: new Date("2026-12-20"),
      status: "ON_PROGRESS",
    },
  });

  await prisma.project.create({
    data: {
      kategori: "CR_FORM",
      jenis: "NEW",
      kodeProject: null,
      nama: "Digital Learning Platform",
      deskripsi: "Pengembangan platform pembelajaran digital untuk seluruh karyawan.",
      pmId: dewi.id,
      bpId: sari.id,
      unitId: hcs.id,
      ownerPic: "Dewi Lestari",
      tanggalProject: new Date("2026-10-05"),
      targetGoLive: new Date("2027-03-31"),
      status: "INISIASI",
    },
  });

  await prisma.project.create({
    data: {
      kategori: "AIR_FORM",
      jenis: "ADDENDUM",
      kodeProject: "CLD-003",
      nama: "Cloud Migration",
      deskripsi: "Migrasi infrastruktur aplikasi ke cloud.",
      pmId: budi.id,
      bpId: rizky.id,
      unitId: its.id,
      ownerPic: "Rizky Aditya",
      tanggalProject: new Date("2026-07-15"),
      targetGoLive: new Date("2027-01-30"),
      status: "ON_HOLD",
    },
  });

  await prisma.project.create({
    data: {
      kategori: "IC_FORM",
      jenis: "NEW",
      kodeProject: "PER-004",
      nama: "Performance Management",
      deskripsi: "Sistem manajemen kinerja karyawan.",
      pmId: dewi.id,
      bpId: sari.id,
      unitId: hcs.id,
      ownerPic: "Sari Wulandari",
      tanggalProject: new Date("2026-08-10"),
      targetGoLive: new Date("2027-02-15"),
      status: "PENDING",
    },
  });

  // Riwayat update untuk project pertama
  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: hcms.id,
        tanggalInput: new Date("2026-10-13"),
        status: "ON_PROGRESS",
        aktivitas: "Analisa data tenaga kerja",
        kendala: null,
        nextAction: "Lanjut analisa",
      },
      {
        projectId: hcms.id,
        tanggalInput: new Date("2026-10-14"),
        status: "ON_PROGRESS",
        aktivitas: "Refine benefit assumption",
        kendala: "Menunggu masukan dari tim Finance",
        nextAction: "Review dengan Finance",
      },
    ],
  });

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());