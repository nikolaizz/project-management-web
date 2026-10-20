import { z } from "zod";
import { STATUS } from "../constants/enums.js";

export const createProjectUpdateSchema = z.object({
  status: z.enum(STATUS, "Status tidak valid"),
  aktivitas: z.string().trim().min(1, "Aktivitas / progress wajib diisi"),
  kendala: z.string().trim().nullish(),
  nextAction: z.string().trim().min(1, "Next action wajib diisi"),
});
