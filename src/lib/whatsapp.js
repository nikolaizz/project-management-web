const STATUS_LABEL = { DRAFT: "Draft", INISIASI: "Inisiasi", ON_PROGRESS: "On Progress", PENDING: "Pending", ON_HOLD: "On Hold", SELESAI: "Selesai" };
const PRIORITAS_LABEL = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
const STATUS_EMOJI = { DRAFT: "⚪", INISIASI: "🟣", ON_PROGRESS: "🔵", PENDING: "🟡", ON_HOLD: "🔴", SELESAI: "🟢" };

const tanggalPanjang = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" });
// Kolom tanggal di database bertipe date (tanpa jam), jadi diformat dalam UTC agar tidak bergeser hari
const tanggalPendek = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

// items: [{ nama, status, prioritas, pmNama, bpNama, ownerPic, targetGoLive, aktivitas, kendala, nextAction }]
// tanggalISO: "YYYY-MM-DD" (hari ini menurut WIB)
export function buildWhatsAppText(items, tanggalISO) {
  const judul = `*Daily Update - ${tanggalPanjang.format(new Date(`${tanggalISO}T12:00:00+07:00`))}*`;

  const blok = items.map((it, i) => {
    const baris = [
      `${i + 1}. *${it.nama}*`,
      `• Status: ${STATUS_EMOJI[it.status] || "⚪"} ${STATUS_LABEL[it.status] || it.status}`,
      `• Prioritas: ${PRIORITAS_LABEL[it.prioritas] || it.prioritas}`,
      `• PM: ${it.pmNama} | BP: ${it.bpNama}`,
      `• Progress: ${it.aktivitas}`,
    ];
    if (it.kendala) baris.push(`• Kendala: ${it.kendala}`);
    baris.push(`• Next Action: ${it.nextAction}`);
    baris.push(`• PIC: ${it.ownerPic} | Target: ${it.targetGoLive ? tanggalPendek.format(it.targetGoLive) : "-"}`);
    return baris.join("\n");
  });

  return [judul, ...blok].join("\n\n");
}