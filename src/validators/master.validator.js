import { z } from "zod";

export const masterSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
});