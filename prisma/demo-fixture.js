export const demoActors = {
  "Budi Santoso": { role: "PROJECT_MANAGER", email: "demo-budi-santoso@example.invalid" },
  "Dewi Lestari": { role: "PROJECT_MANAGER", email: "demo-dewi-lestari@example.invalid" },
  "Nikola Izzan": { role: "PROJECT_MANAGER", email: "demo-nikola-izzan@example.invalid" },
  "Rizky Aditya": { role: "BUSINESS_PARTNER", email: "demo-rizky-aditya@example.invalid" },
  "Sari Wulandari": { role: "BUSINESS_PARTNER", email: "demo-sari-wulandari@example.invalid" },
};

const upd = (date, time, status, aktivitas, kendala, nextAction, updatedBy) => ({ date, time, status, aktivitas, kendala, nextAction, updatedBy });
const stage = (tahap, status = "PLANNED", tanggalRencana = null, catatan = null) => ({ tahap, status, tanggalRencana, catatan });
const stageChange = (tahap, changedAt, status, tanggalRencana = null, catatan = null, updatedBy = null) => ({ tahap, changedAt, status, tanggalRencana, catatan, updatedBy });

export const demoProjects = [
  {
    kategori: "AIR_FORM", jenis: "ADDENDUM", kodeProject: "CLD-003", nama: "Cloud Migration",
    deskripsi: "Migrasi infrastruktur aplikasi ke cloud.", pm: "Budi Santoso", bp: "Rizky Aditya", unit: "HCE", unitKerjaDeveloper: ["DMA"],
    ownerPic: "Rizky Aditya", tanggalProject: "2026-07-15", targetGoLive: "2027-01-30", status: "ON_PROGRESS", prioritas: "LOW", createdAt: "2026-10-22T02:23:03+07:00",
    stages: [stage("PRA_KOMITE"), stage("KOMITE_TI_B"), stage("KOMITE_TI_A")],
    stageHistory: [],
    updates: [
      upd("2026-11-04", "08:47", "ON_PROGRESS", "Tim meninjau arsitektur aplikasi dan menginventarisasi layanan yang akan dipindahkan ke cloud.", null, "Finalisasi daftar layanan bersama tim infrastruktur.", "Budi Santoso"),
      upd("2026-11-05", "13:12", "ON_PROGRESS", "Daftar dependensi aplikasi dan kebutuhan kapasitas awal telah dipetakan.", "Kapasitas untuk salah satu layanan masih perlu dikonfirmasi.", "Minta konfirmasi kapasitas kepada pemilik layanan.", "Rizky Aditya"),
      upd("2026-11-06", "10:36", "ON_PROGRESS", "Rancangan landing zone dan pembagian lingkungan pengembangan mulai disusun.", null, "Tinjau rancangan akses dan jaringan dengan tim keamanan.", "Budi Santoso"),
      upd("2026-11-09", "15:28", "ON_PROGRESS", "Konfigurasi lingkungan uji disiapkan untuk memvalidasi konektivitas layanan.", "Persetujuan aturan jaringan masih menunggu tim infrastruktur.", "Tindak lanjuti persetujuan aturan jaringan.", "Budi Santoso"),
      upd("2026-11-10", "11:04", "ON_PROGRESS", "Rencana migrasi awal dan kriteria pemulihan telah dirapikan untuk ditinjau.", null, "Jadwalkan review rencana migrasi bersama pemilik aplikasi.", "Rizky Aditya"),
    ],
  },
  {
    kategori: "IC_FORM", jenis: "NEW", kodeProject: "PER-004", nama: "Performance Management v3",
    deskripsi: "Sistem manajemen kinerja karyawan.", pm: "Dewi Lestari", bp: "Sari Wulandari", unit: "HCS", unitKerjaDeveloper: ["ADV"],
    ownerPic: "Sari Wulandari", tanggalProject: "2026-08-10", targetGoLive: "2027-02-15", status: "PENDING", prioritas: "HIGH", createdAt: "2026-10-22T02:23:03+07:00",
    stages: [stage("PRA_KOMITE", "SELESAI", "2026-11-05"), stage("KOMITE_TI_B", "ON_PROGRESS", "2026-11-12"), stage("KOMITE_TI_A", "PLANNED", "2026-11-19")],
    stageHistory: [
      stageChange("KOMITE_TI_B", "2026-10-30T04:22:00+07:00", "ON_PROGRESS"),
      stageChange("PRA_KOMITE", "2026-11-05T02:30:42+07:00", "SELESAI", "2026-11-05", null, "Nikola"),
      stageChange("KOMITE_TI_B", "2026-11-05T02:30:42+07:00", "ON_PROGRESS", "2026-11-12", null, "Nikola"),
      stageChange("KOMITE_TI_A", "2026-11-05T02:30:42+07:00", "PLANNED", "2026-11-19", null, "Nikola"),
    ],
    updates: [
      upd("2026-11-04", "10:21", "ON_PROGRESS", "Tim meninjau asumsi manfaat dan metrik yang digunakan dalam Performance Management v3.", "Validasi beberapa asumsi manfaat masih diperlukan.", "Susun daftar asumsi yang perlu dikonfirmasi.", "Dewi Lestari"),
      upd("2026-11-05", "14:08", "ON_PROGRESS", "Daftar indikator kinerja dan sumber data untuk tiap indikator mulai dipetakan.", "Masukan Finance untuk perhitungan manfaat belum diterima.", "Minta review asumsi manfaat dari tim Finance.", "Sari Wulandari"),
      upd("2026-11-06", "09:53", "PENDING", "Rancangan indikator diperbarui berdasarkan hasil pembahasan internal.", "Perhitungan manfaat belum dapat difinalisasi sebelum mendapat masukan Finance.", "Tindak lanjuti review Finance dan catat keputusan.", "Sari Wulandari"),
      upd("2026-11-09", "13:42", "PENDING", "Tim menyiapkan rincian perubahan yang diperlukan setelah validasi asumsi.", "Menunggu konfirmasi Finance terkait dasar perhitungan manfaat.", "Jadwalkan sesi singkat dengan Finance.", "Dewi Lestari"),
      upd("2026-11-10", "15:16", "PENDING", "Ruang lingkup validasi manfaat dan daftar pertanyaan untuk Finance telah dirapikan.", "Persetujuan asumsi manfaat masih menjadi prasyarat untuk melanjutkan.", "Lanjutkan pembahasan dengan Finance sebelum review Komite TI B.", "Sari Wulandari"),
    ],
  },
  {
    kategori: "FS", jenis: "NEW", kodeProject: "AIR-123", nama: "LLM Development",
    deskripsi: "pengembangan ai LLM", pm: "Dewi Lestari", bp: "Sari Wulandari", unit: "HCS", unitKerjaDeveloper: ["ADV", "RDL", "DMA"],
    ownerPic: "nikola", tanggalProject: "2026-10-23", targetGoLive: "2026-12-26", status: "SELESAI", prioritas: "HIGH", createdAt: "2026-10-23T01:40:32+07:00",
    stages: [stage("PRA_KOMITE", "SELESAI", "2026-10-23"), stage("KOMITE_TI_B", "SELESAI", "2026-10-26"), stage("KOMITE_TI_A", "SELESAI", "2026-10-31")],
    stageHistory: [
      stageChange("PRA_KOMITE", "2026-11-02T03:17:00+07:00", "SELESAI", "2026-10-23"),
      stageChange("KOMITE_TI_B", "2026-11-02T03:17:00+07:00", "SELESAI", "2026-10-26"),
    ],
    updates: [
      upd("2026-11-04", "13:27", "ON_PROGRESS", "Tim menyelesaikan pemeriksaan akhir pada alur pemrosesan dan keluaran model.", null, "Tutup temuan pemeriksaan yang tersisa.", "Dewi Lestari"),
      upd("2026-11-05", "09:18", "ON_PROGRESS", "Validasi hasil dan pemeriksaan konsistensi keluaran telah diselesaikan.", null, "Lakukan pemeriksaan akhir bersama pemilik proses.", "Sari Wulandari"),
      upd("2026-11-06", "15:03", "ON_PROGRESS", "Dokumentasi penggunaan dan catatan pengujian akhir dirapikan.", null, "Minta persetujuan akhir pemilik proses.", "Dewi Lestari"),
      upd("2026-11-09", "11:47", "SELESAI", "Pemilik proses menyetujui hasil akhir dan seluruh kriteria penerimaan terpenuhi.", null, "Arsipkan dokumentasi dan catatan serah terima.", "Sari Wulandari"),
      upd("2026-11-10", "14:34", "SELESAI", "Serah terima dokumentasi selesai dan tindak lanjut pascapenyelesaian telah dicatat.", null, "Pantau tindak lanjut minor melalui proses operasional.", "Dewi Lestari"),
    ],
  },
  {
    kategori: "FS", jenis: "NEW", kodeProject: null, nama: "Project Hub v2",
    deskripsi: "project tracking tools web", pm: "Budi Santoso", bp: "Sari Wulandari", unit: "HCE", unitKerjaDeveloper: ["RDL", "WDL"],
    ownerPic: "Nikola", tanggalProject: "2026-10-23", targetGoLive: "2026-12-01", status: "ON_PROGRESS", prioritas: "MEDIUM", createdAt: "2026-10-23T02:18:49+07:00",
    stages: [stage("PRA_KOMITE", "SELESAI", "2026-10-23", "sudah selesai"), stage("KOMITE_TI_B", "ON_PROGRESS", "2026-10-26", "dalam pengembangan"), stage("KOMITE_TI_A", "PLANNED", "2026-10-31", "perencanaan")],
    stageHistory: [],
    updates: [
      upd("2026-11-04", "09:36", "ON_PROGRESS", "Tim merapikan alur daftar project dan menyelaraskan tampilan detail dengan kebutuhan pengguna.", null, "Tinjau konsistensi navigasi pada halaman utama.", "Budi Santoso"),
      upd("2026-11-05", "15:41", "ON_PROGRESS", "Perbaikan validasi form project dan penyimpanan riwayat update telah diselesaikan.", null, "Lanjutkan pemeriksaan alur edit project.", "Sari Wulandari"),
      upd("2026-11-06", "11:22", "ON_PROGRESS", "Alur autentikasi dan pembatasan akses diuji pada skenario pengguna utama.", "Beberapa skenario akses perlu dikonfirmasi kembali.", "Ulangi pemeriksaan peran dan hak akses.", "Budi Santoso"),
      upd("2026-11-09", "08:54", "ON_PROGRESS", "Perbaikan hasil pemeriksaan akses diterapkan dan pengujian regresi dimulai.", null, "Selesaikan pemeriksaan regresi sebelum review.", "Sari Wulandari"),
      upd("2026-11-10", "13:09", "ON_PROGRESS", "Ringkasan hasil pengujian dan daftar pekerjaan dashboard telah diperbarui.", null, "Tinjau prioritas dashboard bersama pemilik project.", "Budi Santoso"),
    ],
  },
  {
    kategori: "FS", jenis: "NEW", kodeProject: "SYN-007", nama: "Dashboard Pemantauan Risiko Operasional",
    deskripsi: "Dashboard untuk memantau indikator risiko operasional dan tindak lanjut unit terkait.", pm: "Nikola Izzan", bp: "Sari Wulandari", unit: "HCS", unitKerjaDeveloper: ["ADV", "RDL"],
    ownerPic: "Nikola Izzan", tanggalProject: "2026-08-01", targetGoLive: "2027-02-28", status: "ON_PROGRESS", prioritas: "HIGH", createdAt: "2026-11-09T03:04:05+07:00",
    stages: [stage("PRA_KOMITE", "SELESAI", "2026-09-30"), stage("KOMITE_TI_B", "ON_PROGRESS", "2026-11-12", "Pembahasan rancangan indikator sedang berjalan."), stage("KOMITE_TI_A", "PLANNED", "2026-12-03")],
    stageHistory: [
      stageChange("PRA_KOMITE", "2026-10-28T02:00:00+07:00", "SELESAI", "2026-09-30", "Dokumen pra-komite disetujui."),
      stageChange("KOMITE_TI_B", "2026-11-06T03:00:00+07:00", "ON_PROGRESS", "2026-11-12", "Pembahasan rancangan indikator dimulai."),
    ],
    updates: [
      upd("2026-11-04", "14:52", "ON_PROGRESS", "Tim memetakan indikator risiko operasional dan sumber data dari unit terkait.", null, "Konfirmasi pemilik dan frekuensi pembaruan tiap indikator.", "Nikola Izzan"),
      upd("2026-11-05", "10:07", "ON_PROGRESS", "Rancangan ringkasan indikator dan tampilan tindak lanjut mulai disusun.", "Definisi ambang batas untuk beberapa indikator belum disepakati.", "Minta masukan pemilik risiko atas ambang batas.", "Sari Wulandari"),
      upd("2026-11-06", "12:31", "ON_PROGRESS", "Prototipe dashboard awal ditinjau bersama perwakilan unit pengguna.", "Masukan terkait klasifikasi tingkat risiko masih dikumpulkan.", "Rangkum masukan unit dan perbarui rancangan.", "Sari Wulandari"),
      upd("2026-11-09", "09:44", "ON_PROGRESS", "Rancangan diperbarui dengan kategori risiko dan informasi tindak lanjut.", "Validasi nilai ambang batas masih menunggu pemilik risiko.", "Konfirmasi ambang batas sebelum pembahasan Komite TI B.", "Nikola Izzan"),
      upd("2026-11-10", "15:38", "ON_PROGRESS", "Daftar indikator dan perubahan prototipe siap dibawa ke pembahasan berikutnya.", null, "Bahas rancangan pada Komite TI B dan catat keputusan.", "Sari Wulandari"),
    ],
  },
  {
    kategori: "CR_FORM", jenis: "NEW", kodeProject: "SYN-008", nama: "Automasi Rekonsiliasi Treasury",
    deskripsi: "Otomasi pencocokan transaksi treasury untuk mempercepat proses rekonsiliasi harian.", pm: "Budi Santoso", bp: "Rizky Aditya", unit: "STA", unitKerjaDeveloper: ["RDL", "DMA"],
    ownerPic: "Alya Ramadhani", tanggalProject: "2026-08-20", targetGoLive: "2027-01-31", status: "PENDING", prioritas: "MEDIUM", createdAt: "2026-11-09T03:04:05+07:00",
    stages: [stage("PRA_KOMITE", "SELESAI", "2026-10-22"), stage("KOMITE_TI_B", "ON_PROGRESS", "2026-11-18", "Review kebutuhan dan pemetaan transaksi."), stage("KOMITE_TI_A", "PLANNED", "2026-12-08")],
    stageHistory: [
      stageChange("PRA_KOMITE", "2026-10-30T08:30:00+07:00", "SELESAI", "2026-10-22", "Pra-komite selesai."),
      stageChange("KOMITE_TI_B", "2026-11-08T04:00:00+07:00", "ON_PROGRESS", "2026-11-18", "Review kebutuhan dimulai."),
    ],
    updates: [
      upd("2026-11-04", "11:16", "ON_PROGRESS", "Tim mendokumentasikan format transaksi dan aturan rekonsiliasi yang berjalan saat ini.", null, "Konfirmasi variasi format dengan unit Treasury.", "Rizky Aditya"),
      upd("2026-11-05", "08:43", "ON_PROGRESS", "Aturan pencocokan awal disusun untuk transaksi dengan referensi yang tersedia.", "Sampel transaksi untuk pengujian belum diterima.", "Minta sampel data uji dari unit Treasury.", "Budi Santoso"),
      upd("2026-11-06", "14:29", "PENDING", "Daftar kasus pencocokan dan pengecualian telah disiapkan untuk pengujian.", "Pengujian belum dapat dimulai tanpa sampel transaksi.", "Tindak lanjuti pengiriman data uji.", "Rizky Aditya"),
      upd("2026-11-09", "10:54", "PENDING", "Tim meninjau kembali kebutuhan data minimum untuk memulai validasi.", "Menunggu sampel transaksi dan konfirmasi format dari Treasury.", "Sepakati jadwal validasi setelah data diterima.", "Budi Santoso"),
      upd("2026-11-10", "12:06", "PENDING", "Aturan pencocokan dan skenario uji telah dirapikan sambil menunggu data.", "Sampel transaksi masih menjadi penghambat pekerjaan berikutnya.", "Koordinasikan eskalasi permintaan data dengan pemilik Treasury.", "Rizky Aditya"),
    ],
  },
  {
    kategori: "AIR_FORM", jenis: "NEW", kodeProject: "SYN-009", nama: "Portal Manajemen Risiko Vendor",
    deskripsi: "Portal untuk mengelola penilaian risiko, dokumen, dan tindak lanjut vendor.", pm: "Dewi Lestari", bp: "Sari Wulandari", unit: "AML", unitKerjaDeveloper: ["WDL", "DMA"],
    ownerPic: "Dito Pratama", tanggalProject: "2026-09-05", targetGoLive: "2027-05-15", status: "ON_HOLD", prioritas: "HIGH", createdAt: "2026-11-09T03:04:05+07:00",
    stages: [stage("PRA_KOMITE", "SELESAI", "2026-10-15"), stage("KOMITE_TI_B", "PLANNED", "2026-11-20", "Jadwal menunggu kesiapan akses lingkungan vendor."), stage("KOMITE_TI_A", "PLANNED", "2026-12-18")],
    stageHistory: [stageChange("PRA_KOMITE", "2026-11-01T02:00:00+07:00", "SELESAI", "2026-10-15", "Tahap pra-komite selesai.")],
    updates: [
      upd("2026-11-04", "15:24", "ON_PROGRESS", "Tim menyusun kebutuhan integrasi portal dan daftar akses yang diperlukan untuk uji vendor.", null, "Kirim permintaan akses ke koordinator vendor.", "Sari Wulandari"),
      upd("2026-11-05", "12:52", "ON_HOLD", "Pekerjaan integrasi dijeda karena akses ke lingkungan uji vendor belum tersedia.", "Akses lingkungan uji belum diberikan.", "Eskalasi permintaan akses melalui koordinator vendor.", "Dewi Lestari"),
      upd("2026-11-06", "08:59", "ON_HOLD", "Tim menyiapkan skenario uji agar dapat dijalankan setelah akses tersedia.", "Ketergantungan pada akses vendor masih belum terselesaikan.", "Minta kepastian jadwal aktivasi akses.", "Sari Wulandari"),
      upd("2026-11-09", "14:17", "ON_HOLD", "Dokumen integrasi dan daftar pemeriksaan teknis dirapikan selama menunggu akses.", "Lingkungan uji vendor belum dapat digunakan.", "Tinjau ulang jadwal uji bersama koordinator vendor.", "Dewi Lestari"),
      upd("2026-11-10", "10:41", "ON_HOLD", "Rencana uji integrasi diperbarui dan siap dijalankan setelah akses dibuka.", "Akses lingkungan uji tetap menjadi penghambat utama.", "Mulai uji konektivitas segera setelah akses aktif.", "Sari Wulandari"),
    ],
  },
  {
    kategori: "IC_FORM", jenis: "NEW", kodeProject: "SYN-010", nama: "Modernisasi Pelaporan Kepatuhan",
    deskripsi: "Pembaruan alur dan format pelaporan kepatuhan agar proses konsolidasi lebih efisien.", pm: "Nikola Izzan", bp: "Rizky Aditya", unit: "HCE", unitKerjaDeveloper: ["ADV", "WDL"],
    ownerPic: "Maya Putri", tanggalProject: "2026-11-01", targetGoLive: "2027-03-31", status: "INISIASI", prioritas: "LOW", createdAt: "2026-11-09T03:04:05+07:00",
    stages: [stage("PRA_KOMITE", "PLANNED", "2026-11-25"), stage("KOMITE_TI_B", "PLANNED", "2026-12-15"), stage("KOMITE_TI_A", "PLANNED", "2027-01-15")],
    stageHistory: [],
    updates: [
      upd("2026-11-04", "09:11", "INISIASI", "Tim mengumpulkan kebutuhan awal dari unit kepatuhan terkait proses pelaporan saat ini.", null, "Minta contoh format laporan yang digunakan tiap unit.", "Nikola Izzan"),
      upd("2026-11-05", "13:34", "INISIASI", "Pemilik data dan pihak yang terlibat dalam konsolidasi laporan mulai diidentifikasi.", null, "Lengkapi daftar unit dan sumber data.", "Rizky Aditya"),
      upd("2026-11-06", "11:58", "INISIASI", "Perbedaan jadwal dan format pelaporan antarunit mulai dicatat.", "Contoh laporan dari beberapa unit masih belum tersedia.", "Tindak lanjuti pengumpulan contoh laporan.", "Nikola Izzan"),
      upd("2026-11-09", "15:49", "INISIASI", "Ruang lingkup awal dan pertanyaan untuk sesi kebutuhan telah disusun.", null, "Validasi ruang lingkup dengan pemilik proses kepatuhan.", "Rizky Aditya"),
      upd("2026-11-10", "08:26", "INISIASI", "Daftar kebutuhan awal dirapikan sebagai bahan pembahasan dengan pemilik proses.", null, "Jadwalkan sesi konfirmasi kebutuhan dan target proses.", "Nikola Izzan"),
    ],
  },
];
