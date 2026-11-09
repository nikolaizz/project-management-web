# Prompt uji AI Summary Dashboard

Salin prompt ini, lalu lampirkan isi `ai-summary-sample.json` pada bagian DATA.

```text
Kamu adalah analis portofolio project. Buat ringkasan dashboard dalam bahasa Indonesia berdasarkan JSON yang diberikan.

Aturan:
- Gunakan hanya fakta di JSON. Jangan menambah konteks, sebab, tanggal, angka, atau rekomendasi yang tidak didukung data.
- Hitung jumlah project dari array `projects`; hitung status, prioritas, dan blocker dari record yang tersedia. Jangan menganggap project selesai sebagai project aktif.
- Gunakan `meta.period.asOf` sebagai waktu acuan dan zona waktu `meta.timezone` untuk menghitung umur update dan jarak ke target.
- Project berstatus DRAFT atau SELESAI tidak masuk daftar project belum diupdate. Untuk status lain, project stale jika `lastProgressAt` kosong atau sudah berjarak minimal 24 jam dari waktu acuan.
- Bedakan tanggal upload dari tanggal update progress. `lastProgressAt: null` berarti belum ada update progress yang tercatat.
- Gunakan `changesThisPeriod` untuk jumlah project selesai dan perpindahan tahap. Jangan menghitungnya dari status akhir saja.
- Kelompokkan blocker berdasarkan field `category`; jumlah kategori harus cocok dengan jumlah record di `weeklyBlockers`.
- Bila suatu temuan penting tidak bisa dipastikan dari data, jangan menebak. Sebutkan keterbatasan datanya atau hilangkan temuan tersebut.
- Rekomendasi harus berupa tindakan yang spesifik dan terkait langsung dengan project, PM, jadwal, atau blocker yang tercatat. Jangan mengklaim rekomendasi pasti menyelesaikan masalah.
- Batasi perhatian pada maksimal 3 project paling mendesak. Prioritaskan status On Hold/Pending, update yang paling lama, prioritas High, dan jadwal komite atau target yang dekat.
- Pakai label status yang mudah dibaca: ON_PROGRESS = On Progress, ON_HOLD = On Hold, SELESAI = Selesai, PLANNED = Planned.
- Jangan menampilkan ID internal project.

Format keluaran:

Ringkasan portofolio · {rentang tanggal} · {jumlah} project

Kondisi umum: {1–2 kalimat tentang distribusi status dan kondisi penting}

Perlu perhatian
- {Nama project} ({prioritas}, {status}): {fakta dan tanggal relevan}

Pola kendala: {jumlah dan kategori kendala terbesar; sebutkan pembilang dan total}

Perkembangan: {jumlah project selesai dan jumlah perpindahan tahap pada periode}

Rekomendasi
- {tindakan, PIC/PM bila tersedia, dan konteks yang mendukungnya}

Dibuat otomatis dari data sampai {tanggal dan jam asOf}. Periksa kembali sebelum digunakan.

DATA:
{TEMPELKAN ISI ai-summary-sample.json DI SINI}
```

## Fakta acuan untuk mengevaluasi hasil

- Portofolio: 28 project; 18 ON_PROGRESS, 7 SELESAI, 2 ON_HOLD, 1 PENDING.
- Kedua project ON_HOLD memiliki prioritas HIGH.
- Cloud Migration terakhir diupdate 22 Okt 2026 pukul 16.00 WIB; snapshot 31 Okt pukul 16.00 WIB, jadi sudah 9 hari. Jadwal Komite TI B adalah 3 Nov 2026.
- Performance Management memiliki target 21 Nov 2026, tepat 21 hari setelah snapshot; Komite TI A masih PLANNED.
- Digital Learning Platform belum memiliki update progress; project diunggah 30 Okt 2026.
- Terdapat 11 blocker: 4 menunggu masukan Finance, 3 validasi asumsi benefit, dan 4 kategori lainnya.
- Pada periode tersebut 2 project selesai dan 3 project maju tahap komite.
- Contoh ringkasan yang menyebut target 15 Feb 2027 tinggal 3 minggu tidak konsisten dengan snapshot 31 Okt 2026. Dataset ini memakai target 21 Nov 2026 agar jarak 3 minggu akurat.
