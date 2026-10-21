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