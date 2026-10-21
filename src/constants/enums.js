// Nilai yang diperbolehkan untuk kategori project, jenis project, dan statusnya.
// Nilai-nilai ini dipakai ulang oleh validasi request dan endpoint data master.
export const KATEGORI = ["FS", "CR_FORM", "AIR_FORM", "IC_FORM", "SC_FORM"];
export const JENIS = ["NEW", "ADDENDUM"];
export const STATUS = [
  "DRAFT",
  "INISIASI",
  "ON_PROGRESS",
  "PENDING",
  "ON_HOLD",
  "SELESAI",
];
export const TAHAP = ["PRA_KOMITE", "KOMITE_TI_B", "KOMITE_TI_A"];
export const STATUS_TAHAPAN = ["PLANNED", "ON_PROGRESS", "SELESAI"];