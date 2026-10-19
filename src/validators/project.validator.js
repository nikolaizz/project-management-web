import { z } from "zod";
import { KATEGORI, JENIS, STATUS } from "../constants/enums.js";

const id = (label) =>
  z.coerce
    .number(`${label} wajib dipilih`)
    .int()
    .positive(`${label} wajib dipilih`);

const stringId = (label) =>
  z.string().trim().min(1, `${label} wajib dipilih`);

// Field yang dipakai bersama oleh create dan update
const projectFields = {
  kategori: z.enum(KATEGORI, `Kategori harus salah satu dari: ${KATEGORI.join(", ")}`),
  jenis: z.enum(JENIS, `Jenis project harus salah satu dari: ${JENIS.join(", ")}`),
  kodeProject: z.string().trim().nullish(), // "" / null / kosong dinormalisasi di controller
  nama: z.string().trim().min(1, "Nama project wajib diisi"),
  deskripsi: z.string().trim().min(1, "Deskripsi project wajib diisi"),
  pmId: stringId("PM"),
  bpId: stringId("BP"),
  unitId: id("Unit pengusul"),
  ownerPic: z.string().trim().min(1, "Owner / PIC wajib diisi"),
  tanggalProject: z.iso.date("Tanggal project harus berformat YYYY-MM-DD"),
  targetGoLive: z.iso.date("Target go live harus berformat YYYY-MM-DD").nullish(),
};

// POST: semua wajib (kecuali yang nullish), status default INISIASI
export const createProjectSchema = z
  .object({
    ...projectFields,
    status: z.enum(STATUS, "Status tidak valid").default("INISIASI"),
  })
  // ASUMSI SEMENTARA: Addendum wajib punya kode. Hapus kalau tidak wajib.
  .refine((d) => d.jenis !== "ADDENDUM" || d.kodeProject, {
    message: "Kode project wajib diisi untuk jenis Addendum",
    path: ["kodeProject"],
  });

// PUT: semua field opsional; perubahan status wajib disertai catatan riwayat.
export const updateProjectSchema = z
  .object({
    ...projectFields,
    status: z.enum(STATUS, "Status tidak valid").optional(),
    aktivitas: z.string().trim().min(1, "Aktivitas wajib diisi").optional(),
    kendala: z.string().trim().nullish(),
    nextAction: z.string().trim().min(1, "Next action wajib diisi").optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    if (data.status === undefined) return;
    if (!data.aktivitas) {
      ctx.addIssue({ code: "custom", path: ["aktivitas"], message: "Aktivitas wajib diisi saat status diubah" });
    }
    if (!data.nextAction) {
      ctx.addIssue({ code: "custom", path: ["nextAction"], message: "Next action wajib diisi saat status diubah" });
    }
  });
