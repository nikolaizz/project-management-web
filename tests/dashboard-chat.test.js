import test from "node:test";
import assert from "node:assert/strict";
import { dashboardChatIntentSchema, dashboardChatMessageSchema } from "../src/validators/dashboardChat.validator.js";
import { buildDashboardChatWhere } from "../src/lib/dashboardChat.js";
import { getCurrentStage } from "../src/lib/stages.js";
import { hoursWithoutProgress, staleProjectWhere } from "../src/lib/staleProjects.js";

const emptyFilters = {
  status: null,
  currentStage: null,
  priority: null,
  pmName: null,
  bpName: null,
  unitKerjaDeveloper: null,
  projectQuery: null,
  excludeCompleted: false,
};

test("chat message rejects blank and overlong input", () => {
  assert.equal(dashboardChatMessageSchema.safeParse({ message: "  " }).success, false);
  assert.equal(dashboardChatMessageSchema.safeParse({ message: "x".repeat(501) }).success, false);
  assert.equal(dashboardChatMessageSchema.safeParse({ message: "  status project  " }).data.message, "status project");
});

test("chat intent rejects unsupported enum values and conflicting filters", () => {
  const valid = { intent: "list_projects", filters: emptyFilters, clarification: null };
  assert.equal(dashboardChatIntentSchema.safeParse(valid).success, true);
  assert.equal(dashboardChatIntentSchema.safeParse({ ...valid, filters: { ...emptyFilters, status: "COMPLETED" } }).success, false);
  assert.equal(dashboardChatIntentSchema.safeParse({ ...valid, intent: "project_latest_update" }).success, false);
  assert.equal(dashboardChatIntentSchema.safeParse({ ...valid, filters: { ...emptyFilters, status: "SELESAI", excludeCompleted: true } }).success, false);
});

test("current stage is the first unfinished stage or Selesai", () => {
  assert.equal(getCurrentStage([{ tahap: "PRA_KOMITE", status: "SELESAI" }]), "KOMITE_TI_B");
  assert.equal(getCurrentStage(["PRA_KOMITE", "KOMITE_TI_B", "KOMITE_TI_A"].map((tahap) => ({ tahap, status: "SELESAI" }))), "SELESAI");
});

test("chat query combines PM, BP, developer, current-stage, and stale filters", () => {
  const cutoff = new Date("2026-11-10T09:00:00Z");
  const where = buildDashboardChatWhere({ ...emptyFilters, pmName: "Budi", bpName: "Rizky", unitKerjaDeveloper: "ADV", currentStage: "KOMITE_TI_B" }, "list_stale_projects", cutoff);
  assert.deepEqual(where.pm.is.nama, { contains: "Budi", mode: "insensitive" });
  assert.deepEqual(where.bp.is.nama, { contains: "Rizky", mode: "insensitive" });
  assert.deepEqual(where.unitKerjaDeveloper, { has: "ADV" });
  assert.deepEqual(where.AND[0], { stages: { some: { tahap: "PRA_KOMITE", status: "SELESAI" } } });
  assert.deepEqual(where.AND.at(-1), staleProjectWhere(cutoff));
});

test("stale age uses the latest update or project creation as its baseline", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  assert.equal(hoursWithoutProgress({ createdAt: new Date("2026-11-08T12:00:00Z"), updates: [] }, now), 48);
  assert.equal(hoursWithoutProgress({ createdAt: new Date("2026-11-01T12:00:00Z"), updates: [{ tanggalInput: new Date("2026-11-10T10:00:00Z") }] }, now), 2);
});
