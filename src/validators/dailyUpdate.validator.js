import { z } from "zod";
import { STATUS } from "../constants/enums.js";

const projectId = z.coerce.number("Project wajib dipilih").int().positive("Project wajib dipilih");
const status = z.enum(STATUS, "Status tidak valid").optional();
const teks = z.string().trim().max(1000, "Maksimal 1000 karakter");

const daftar = (itemSchema) =>
  z
    .array(itemSchema)
    .min(1, "Isi minimal satu project")
    .max(10, "Maksimal 10 project sekali kirim")
    .refine((list) => new Set(list.map((i) => i.projectId)).size === list.length, {
      message: "Satu project tidak boleh dipilih dua kali dalam satu pesan",
    });

// Simpan: aktivitas dan next action wajib
export const createDailyUpdatesSchema = z.object({
  items: daftar(
    z.object({
      projectId,
      status,
      aktivitas: teks.min(1, "Aktivitas / progress wajib diisi"),
      kendala: teks.nullish(),
      nextAction: teks.min(1, "Next action wajib diisi"),
    })
  ),
});

// Preview: isian boleh belum lengkap, yang penting project sudah dipilih
export const previewDailyUpdatesSchema = z.object({
  items: daftar(
    z.object({
      projectId,
      status,
      aktivitas: teks.nullish(),
      kendala: teks.nullish(),
      nextAction: teks.nullish(),
    })
  ),
});