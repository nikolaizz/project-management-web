import { z } from "zod";
import { KATEGORI, JENIS, STATUS } from "../constants/enums.js";

const id = (label) =>
  z.coerce
    .number(`${label} wajib dipilih`)
    .int()
    .positive(`${label} wajib dipilih`);

// Field yang dipakai bersama oleh create dan update
const projectFields = {
  kategori: z.enum(KATEGORI, `Kategori harus salah satu dari: ${KATEGORI.join(", ")}`),
  jenis: z.enum(JENIS, `Jenis project harus salah satu dari: ${JENIS.join(", ")}`),
  kodeProject: z.string().trim().nullish(), // "" / null / kosong dinormalisasi di controller
  nama: z.string().trim().min(1, "Nama project wajib diisi"),
  deskripsi: z.string().trim().min(1, "Deskripsi project wajib diisi"),
  pmId: id("PM"),
  bpId: id("BP"),
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

// PUT: semua opsional. Status sengaja TIDAK ada di sini,
// karena perubahan status nanti lewat menu Update Project (tercatat di history).
export const updateProjectSchema = z.object(projectFields).partial();