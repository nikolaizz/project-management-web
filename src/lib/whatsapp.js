const STATUS_LABEL = { DRAFT: "Draft", INISIASI: "Inisiasi", ON_PROGRESS: "On Progress", PENDING: "Pending", ON_HOLD: "On Hold", SELESAI: "Selesai" };
const STATUS_EMOJI = { DRAFT: "⚪", INISIASI: "🟣", ON_PROGRESS: "🔵", PENDING: "🟡", ON_HOLD: "🔴", SELESAI: "🟢" };
const KATEGORI_LABEL = { FS: "FS", CR_FORM: "CR Form", AIR_FORM: "AIR Form", IC_FORM: "IC Form", SC_FORM: "SC Form" };
const PRIORITAS_LABEL = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

const tanggalPanjang = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" });
// Kolom tanggal di database bertipe date (tanpa jam), jadi diformat dalam UTC agar tidak bergeser hari
const tanggalPendek = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

// Penanda daftar yang diketik user di awal baris (-, *, +, •, –, —) diikuti spasi.
// WhatsApp mengubah baris berawalan "- " atau "* " menjadi daftar sendiri, jadi penanda ini dibuang
// dan diganti penanda kita supaya susunannya tidak berantakan.
const PENANDA_DAFTAR = /^\s*(?:[-*+•–—]\s+)+/;

function barisBersih(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(PENANDA_DAFTAR, "").trim())
    .filter(Boolean);
}

// Satu baris   -> "• *Label:* isi"
// Banyak baris -> "• *Label:*" lalu tiap baris menjadi sub-poin di bawahnya
function field(label, value) {
  const lines = barisBersih(value);
  if (lines.length === 0) return null;
  if (lines.length === 1) return `• *${label}:* ${lines[0]}`;
  return [`• *${label}:*`, ...lines.map((l) => `   ◦ ${l}`)].join("\n");
}

// Keterangan di samping nama project: "(AIR-123 — CR Form)", atau "(CR Form)" kalau belum punya kode
function judulProject(it) {
  const kategori = KATEGORI_LABEL[it.kategori] || it.kategori;
  const isi = [it.kode, kategori].filter(Boolean).join(" — ");
  return isi ? ` (${isi})` : "";
}

// items: [{ nama, status, prioritas, pmNama, bpNama, ownerPic, targetGoLive, aktivitas, kendala, nextAction }]
// tanggalISO: "YYYY-MM-DD" (hari ini menurut WIB)
export function buildWhatsAppText(items, tanggalISO) {
  const judul = `*Daily Update - ${tanggalPanjang.format(new Date(`${tanggalISO}T12:00:00+07:00`))}*`;

  const blok = items.map((it, i) => {
    const target = it.targetGoLive ? tanggalPendek.format(it.targetGoLive) : "-";
    return [
      `${i + 1}. *${it.nama}*${judulProject(it)}`,
      `• *Status:* ${STATUS_EMOJI[it.status] || "⚪"} ${STATUS_LABEL[it.status] || it.status}`,
      `• *Prioritas:* ${PRIORITAS_LABEL[it.prioritas] || it.prioritas}`,
      `• *PM:* ${it.pmNama} | *BP:* ${it.bpNama}`,
      field("Progress", it.aktivitas),
      field("Kendala", it.kendala), // hilang kalau kosong
      field("Next Action", it.nextAction),
      `• *PIC:* ${it.ownerPic} | *Target:* ${target}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [judul, ...blok].join("\n\n");
}