import { z } from "zod";
import { PRIORITAS, STATUS, TAHAP, UNIT_KERJA_DEVELOPER } from "../constants/enums.js";

const optionalText = z.string().trim().min(1).max(150).nullable();

export const dashboardChatMessageSchema = z.object({
  message: z.string().trim().min(1, "Pertanyaan tidak boleh kosong").max(500, "Pertanyaan maksimal 500 karakter"),
}).strict();

export const dashboardChatIntentSchema = z.object({
  intent: z.enum(["count_projects", "list_projects", "project_latest_update", "list_stale_projects", "clarify", "unsupported"]),
  filters: z.object({
    status: z.enum(STATUS).nullable(),
    currentStage: z.enum([...TAHAP, "SELESAI"]).nullable(),
    priority: z.enum(PRIORITAS).nullable(),
    pmName: optionalText,
    bpName: optionalText,
    unitKerjaDeveloper: z.enum(UNIT_KERJA_DEVELOPER).nullable(),
    projectQuery: optionalText,
    excludeCompleted: z.boolean(),
  }).strict(),
  clarification: z.string().trim().min(1).max(300).nullable(),
}).strict().superRefine((intent, context) => {
  if (intent.intent === "project_latest_update" && !intent.filters.projectQuery) {
    context.addIssue({ code: "custom", path: ["filters", "projectQuery"], message: "Nama atau kode project diperlukan" });
  }
  if (intent.filters.excludeCompleted && intent.filters.status === "SELESAI") {
    context.addIssue({ code: "custom", path: ["filters", "status"], message: "Filter status bertentangan" });
  }
});
