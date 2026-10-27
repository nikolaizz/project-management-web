import { z } from "zod";
import { STATUS } from "../constants/enums.js";

const itemSchema = z.object({
  projectId: z.coerce.number("Project wajib dipilih").int().positive("Project wajib dipilih"),
  status: z.enum(STATUS, "Status tidak valid").optional(),
  aktivitas: z.string().trim().min(1, "Aktivitas / progress wajib diisi").max(1000, "Maksimal 1000 karakter"),
  kendala: z.string().trim().max(1000, "Maksimal 1000 karakter").nullish(),
  nextAction: z.string().trim().min(1, "Next action wajib diisi").max(1000, "Maksimal 1000 karakter"),
});

export const createDailyUpdatesSchema = z.object({
  items: z
    .array(itemSchema)
    .min(1, "Isi minimal satu project")
    .max(10, "Maksimal 10 project sekali kirim")
    .refine((list) => new Set(list.map((i) => i.projectId)).size === list.length, {
      message: "Satu project tidak boleh dipilih dua kali dalam satu pesan",
    }),
});