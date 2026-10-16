import { z } from "zod";
import { KATEGORI, JENIS, STATUS } from "../constants/enums.js";

// Membuat aturan untuk ID numerik positif; menerima angka maupun teks angka dari form.
const id = (label) =>
  z.coerce
    .number(`${label} wajib dipilih`)
    .int()
    .positive(`${label} wajib dipilih`);

export const createProjectSchema = z
  .object({
    // Enum memastikan nilai cocok dengan daftar pilihan yang diizinkan.
    kategori: z.enum(KATEGORI, `Kategori harus salah satu dari: ${KATEGORI.join(", ")}`),
    jenis: z.enum(JENIS, `Jenis project harus salah satu dari: ${JENIS.join(", ")}`),

    // kosong / null / "" semuanya dianggap tidak ada kode
    kodeProject: z.string().trim().nullish().transform((v) => v || null),

    nama: z.string().trim().min(1, "Nama project wajib diisi"),
    deskripsi: z.string().trim().min(1, "Deskripsi project wajib diisi"),

    pmId: id("PM"),
    bpId: id("BP"),
    unitId: id("Unit pengusul"),

    ownerPic: z.string().trim().min(1, "Owner / PIC wajib diisi"),

    // Tanggal harus berbentuk YYYY-MM-DD; targetGoLive boleh tidak diisi.
    tanggalProject: z.iso.date("Tanggal project harus berformat YYYY-MM-DD"),
    targetGoLive: z.iso.date("Target go live harus berformat YYYY-MM-DD").nullish(),

    status: z.enum(STATUS, "Status tidak valid").default("INISIASI"),
  })
  // ASUMSI SEMENTARA: Addendum wajib punya kode (karena merujuk project yang sudah ada).
  // Hapus bagian ini kalau ternyata tidak wajib.
  .refine((d) => d.jenis !== "ADDENDUM" || d.kodeProject, {
    message: "Kode project wajib diisi untuk jenis Addendum",
    path: ["kodeProject"],
  });