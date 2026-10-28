import { z } from "zod";
import { KATEGORI, JENIS, STATUS, TAHAP, STATUS_TAHAPAN, PRIORITAS} from "../constants/enums.js";

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
  prioritas: z.enum(PRIORITAS, `Prioritas harus salah satu dari: ${PRIORITAS.join(", ")}`),
};

const stageSchema = z.object({
  tahap: z.enum(TAHAP, `Tahapan harus salah satu dari: ${TAHAP.join(", ")}`),
  tanggalRencana: z.iso.date("Tanggal rencana harus berformat YYYY-MM-DD").nullish(),
  status: z
    .enum(STATUS_TAHAPAN, `Status tahapan harus salah satu dari: ${STATUS_TAHAPAN.join(", ")}`)
    .optional(),
  catatan: z.string().trim().max(500, "Catatan maksimal 500 karakter").nullish(),
});

const stagesSchema = z
  .array(stageSchema)
  .max(3, "Maksimal 3 tahapan")
  .refine((list) => new Set(list.map((s) => s.tahap)).size === list.length, {
    message: "Tahapan tidak boleh duplikat",
  });

// POST: semua wajib (kecuali yang nullish), status default INISIASI
export const createProjectSchema = z
  .object({
    ...projectFields,
    prioritas: z.enum(PRIORITAS, `Prioritas harus salah satu dari: ${PRIORITAS.join(", ")}`).default("MEDIUM"),
    status: z.enum(STATUS, "Status tidak valid").default("INISIASI"),
    stages: stagesSchema.optional(),
  })
  // ASUMSI SEMENTARA: Addendum wajib punya kode. Hapus kalau tidak wajib.
  .refine((d) => d.jenis !== "ADDENDUM" || d.kodeProject, {
    message: "Kode project wajib diisi untuk jenis Addendum",
    path: ["kodeProject"],
  });

// PUT: semua field opsional; perubahan status wajib disertai catatan riwayat.
export const updateProjectSchema = z.object(projectFields).partial();
  
  // PUT /projects/:id/stages: kirim hanya tahapan yang berubah
export const updateStagesSchema = z.object({
  stages: stagesSchema.min(1, "Kirim minimal satu tahapan"),
});