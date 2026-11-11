import { currentStageFilter } from "./stages.js";
import { staleProjectWhere } from "./staleProjects.js";

export function buildDashboardChatWhere(filters, intent, cutoff) {
  const where = {};
  const conditions = [];
  if (filters.status) where.status = filters.status;
  else if (filters.excludeCompleted) where.status = { not: "SELESAI" };
  if (filters.priority) where.prioritas = filters.priority;
  if (filters.pmName) where.pm = { is: { nama: { contains: filters.pmName, mode: "insensitive" } } };
  if (filters.bpName) where.bp = { is: { nama: { contains: filters.bpName, mode: "insensitive" } } };
  if (filters.unitKerjaDeveloper) where.unitKerjaDeveloper = { has: filters.unitKerjaDeveloper };
  if (filters.projectQuery) {
    where.OR = [
      { nama: { contains: filters.projectQuery, mode: "insensitive" } },
      { kodeProject: { contains: filters.projectQuery, mode: "insensitive" } },
    ];
  }
  if (filters.currentStage) conditions.push(...currentStageFilter(filters.currentStage));
  if (intent === "list_stale_projects") conditions.push(staleProjectWhere(cutoff));
  if (conditions.length) where.AND = conditions;
  return where;
}
