import { TAHAP } from "../constants/enums.js";

// Selalu menghasilkan 3 baris tahapan (Pra Komite, TI B, TI A).
// Tahapan yang tidak dikirim diisi nilai default.
export function buildStages(input = []) {
  return TAHAP.map((tahap) => {
    const s = input.find((x) => x.tahap === tahap) || {};
    return {
      tahap,
      tanggalRencana: s.tanggalRencana ? new Date(s.tanggalRencana) : null,
      status: s.status || "PLANNED",
      catatan: s.catatan || null,
    };
  });
}

export function currentStageFilter(tahap) {
  if (tahap === "SELESAI") {
    return TAHAP.map((stage) => ({ stages: { some: { tahap: stage, status: "SELESAI" } } }));
  }
  const index = TAHAP.indexOf(tahap);
  return [
    ...TAHAP.slice(0, index).map((stage) => ({ stages: { some: { tahap: stage, status: "SELESAI" } } })),
    { stages: { none: { tahap, status: "SELESAI" } } },
  ];
}

export function getCurrentStage(stages = []) {
  const completed = new Set(stages.filter((stage) => stage.status === "SELESAI").map((stage) => stage.tahap));
  return TAHAP.find((tahap) => !completed.has(tahap)) ?? "SELESAI";
}
