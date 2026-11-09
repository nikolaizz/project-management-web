import { createHash } from "node:crypto";
import prisma from "../lib/prisma.js";
import { STATUS, TAHAP, STATUS_TAHAPAN } from "../constants/enums.js";
import { todayWIB } from "../lib/dates.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const aiSummaryKey = "portfolio";
const aiSummaryProjectInclude = {
  pm: true,
  bp: true,
  unitPengusul: true,
  stages: { orderBy: { tahap: "asc" } },
  updates: {
    orderBy: [{ tanggalInput: "asc" }, { id: "asc" }],
    include: { modifiedBy: { select: { id: true, nama: true, role: true } } },
  },
  stageHistory: {
    orderBy: [{ changedAt: "asc" }, { id: "asc" }],
    include: { modifiedBy: { select: { id: true, nama: true, role: true } } },
  },
  documents: {
    orderBy: [{ uploadedAt: "asc" }, { id: "asc" }],
    select: { id: true, projectId: true, namaFile: true, ukuran: true, tipe: true, uploadedAt: true },
  },
};

async function getAiSummaryProjects() {
  return prisma.project.findMany({ orderBy: { id: "asc" }, include: aiSummaryProjectInclude });
}

function hashAiSummaryProjects(projects) {
  return createHash("sha256").update(JSON.stringify(projects)).digest("hex");
}

function dayOffset(date, today) {
  if (!date) return null;
  const target = new Date(date).toISOString().slice(0, 10);
  return Math.round((Date.parse(`${target}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
}

function safeText(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getPeriodChanges(projects, periodStart) {
  const completedProjectIds = new Set();
  const committeeStageAdvances = [];
  const progressRank = { PLANNED: 0, ON_PROGRESS: 1, SELESAI: 2 };

  for (const project of projects) {
    let previousProjectStatus = null;
    for (const update of project.updates) {
      if (new Date(update.tanggalInput) >= periodStart && update.status === "SELESAI" && previousProjectStatus && previousProjectStatus !== "SELESAI") {
        completedProjectIds.add(project.id);
      }
      previousProjectStatus = update.status;
    }

    const previousStageStatus = new Map();
    for (const change of project.stageHistory) {
      const previous = previousStageStatus.get(change.tahap) ?? "PLANNED";
      if (new Date(change.changedAt) >= periodStart && progressRank[change.status] > progressRank[previous]) {
        committeeStageAdvances.push({
          projectId: project.id,
          date: change.changedAt,
          stage: change.tahap,
          from: previous,
          to: change.status,
        });
      }
      previousStageStatus.set(change.tahap, change.status);
    }
  }

  return { completedProjectIds: [...completedProjectIds], committeeStageAdvances };
}

export async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [totalProjects, statusGroups, stageGroups, priorities, staleProjects] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.projectStage.groupBy({ by: ["tahap", "status"], _count: { _all: true } }),
      prisma.project.findMany({
        take: 5,
        orderBy: [{ prioritas: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
        select: { id: true, nama: true, kodeProject: true, prioritas: true, status: true, stages: { select: { tahap: true, status: true } } },
      }),
      prisma.project.findMany({
        where: {
          status: { notIn: ["DRAFT", "SELESAI"] },
          createdAt: { lt: cutoff },
          updates: { none: { tanggalInput: { gte: cutoff } } },
        },
        select: {
          id: true,
          nama: true,
          kodeProject: true,
          status: true,
          ownerPic: true,
          createdAt: true,
          updates: { orderBy: { tanggalInput: "desc" }, take: 1, select: { tanggalInput: true } },
        },
      }),
    ]);

    const statusCounts = Object.fromEntries(STATUS.map((status) => [status, 0]));
    for (const group of statusGroups) statusCounts[group.status] = group._count._all;

    const stageCounts = Object.fromEntries(TAHAP.map((tahap) => [
      tahap,
      Object.fromEntries(STATUS_TAHAPAN.map((status) => [status, 0])),
    ]));
    for (const group of stageGroups) stageCounts[group.tahap][group.status] = group._count._all;
    staleProjects.sort((a, b) => {
      const lastA = a.updates[0]?.tanggalInput ?? a.createdAt;
      const lastB = b.updates[0]?.tanggalInput ?? b.createdAt;
      return new Date(lastA) - new Date(lastB);
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        statusCounts,
        stageCounts,
        priorities,
        staleProjects: staleProjects.map((project) => {
          const lastProgressAt = project.updates[0]?.tanggalInput ?? null;
          const lastActivity = lastProgressAt ?? project.createdAt;
          return { ...project, lastProgressAt, hoursWithoutUpdate: Math.floor((now.getTime() - lastActivity.getTime()) / 3600000) };
        }),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAiSummary(req, res, next) {
  try {
    const saved = await prisma.dashboardAiSummary.findUnique({ where: { key: aiSummaryKey } });
    if (!saved) return res.json({ success: true, data: null });

    const projects = await getAiSummaryProjects();
    res.json({
      success: true,
      data: {
        ...saved.result,
        generatedAt: saved.generatedAt,
        dataAsOf: saved.dataAsOf,
        isStale: hashAiSummaryProjects(projects) !== saved.dataHash,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createAiSummary(req, res) {
  if (!process.env.LLM_BASE_URL || !process.env.LLM_API_KEY || !process.env.LLM_MODEL) {
    return res.status(503).json({ success: false, message: "Summary gagal dibuat. Konfigurasi AI belum lengkap." });
  }

  try {
    const now = new Date();
    const today = todayWIB();
    const periodStartDate = new Date(Date.parse(`${today}T00:00:00Z`) - 6 * DAY_MS).toISOString().slice(0, 10);
    const periodStart = new Date(`${periodStartDate}T00:00:00+07:00`);
    const [totalProjects, statusGroups, priorityGroups, stageGroups, projects, highHoldCount] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.project.groupBy({ by: ["prioritas"], _count: { _all: true } }),
      prisma.projectStage.groupBy({ by: ["tahap", "status"], _count: { _all: true } }),
      getAiSummaryProjects(),
      prisma.project.count({ where: { status: "ON_HOLD", prioritas: "HIGH" } }),
    ]);
    const dataHash = hashAiSummaryProjects(projects);

    const statusCounts = Object.fromEntries(STATUS.map((status) => [status, 0]));
    for (const group of statusGroups) statusCounts[group.status] = group._count._all;
    const priorityCounts = Object.fromEntries(["HIGH", "MEDIUM", "LOW"].map((priority) => [priority, 0]));
    for (const group of priorityGroups) priorityCounts[group.prioritas] = group._count._all;
    const stageCounts = Object.fromEntries(TAHAP.map((tahap) => [tahap, Object.fromEntries(STATUS_TAHAPAN.map((status) => [status, 0]))]));
    for (const group of stageGroups) stageCounts[group.tahap][group.status] = group._count._all;

    const projectDetails = new Map(projects.map((project) => [project.id, project]));
    const weeklyBlockers = projects.flatMap((project) => project.updates
      .filter((update) => new Date(update.tanggalInput) >= periodStart && update.kendala?.trim())
      .map((update) => ({ updateId: update.id, projectId: project.id, projectName: project.nama, reportedAt: update.tanggalInput, description: update.kendala })));
    const changesThisPeriod = getPeriodChanges(projects, periodStart);

    const input = {
  meta: { asOf: now.toISOString(), timezone: "Asia/Jakarta", period: { start: periodStartDate, end: today } },
  portfolio: { totalProjects, statusCounts, priorityCounts, highPriorityOnHold: highHoldCount, committeeStageCounts: stageCounts },
  projects, // disarankan: tambahkan field daysOverdue per tahap (lihat catatan di bawah)
  weeklyBlockers,
  changesThisPeriod,
  labels: {
    status: { ON_PROGRESS: "On Progress", PENDING: "Pending", ON_HOLD: "On Hold", SELESAI: "Selesai", DRAFT: "Draft" },
    stage: { PRA_KOMITE: "Pra-Komite", KOMITE_TI_A: "Komite TI A", KOMITE_TI_B: "Komite TI B" },
    priority: { HIGH: "High", MEDIUM: "Medium", LOW: "Low" },
  },
  constraints: [
    // Akurasi
    "Gunakan hanya data yang tersedia; jangan mengarang fakta, angka, sebab, atau rekomendasi.",
    "Untuk project DRAFT atau SELESAI, jangan masukkan ke daftar project yang belum diupdate.",
    "Gunakan changesThisPeriod untuk jumlah project selesai dan perubahan tahapan; jangan menghitung dari status akhir saja.",

    // Struktur: satu project hanya muncul sekali
    "Setiap project hanya boleh muncul SATU kali di seluruh output. Gabungkan masalah dan tindakan dalam satu item attention (insight + action); jangan ulangi di bagian lain.",
    "attention maksimal 3 project. Urutkan berdasarkan prioritas (High > Medium > Low), lalu keterlambatan terbesar. Jika tidak ada, kembalikan array kosong.",
    "review berisi maksimal 2 temuan penting di luar project pada attention (mis. asumsi benefit yang perlu dicek, laporan menunggu keputusan). Jika tidak ada, array kosong.",

    // Panjang
    "condition: 1-2 kalimat, maksimal 35 kata. Cukup sebut sebaran status sekali dan perkembangan periode ini. Jangan mengulang informasi yang sama.",
    "insight maksimal 20 kata, action maksimal 15 kata (kalimat perintah yang spesifik, diawali kata kerja).",
    "blockerPattern maksimal 25 kata. Jika hanya 1 record atau tidak ada pola berulang, kembalikan string kosong \"\" (jangan menulis 'belum ada pola').",
    "dataQualityNote maksimal 20 kata, hanya jika ada update yang tidak informatif (teks acak/kosong). Jika tidak ada, kembalikan \"\".",

    // Gaya bahasa
    "Jangan menyalin teks mentah dari data (termasuk teks acak seperti 'asdf'); rangkum maknanya. Kutipan hanya boleh jika sangat penting dan maksimal 3 kata.",
    "Terjemahkan nilai enum memakai labels (mis. KOMITE_TI_B menjadi 'Komite TI B', ON_PROGRESS menjadi 'On Progress'). Jangan tampilkan nilai berformat database.",
    "Tampilkan keterlambatan sebagai jumlah hari (mis. 'terlambat 20 hari'), bukan tanggal rencana. Pakai daysOverdue dari data; jangan hitung sendiri.",
    "Pisahkan masalah kualitas data (update tidak informatif) ke dataQualityNote; jangan campur dengan status project di insight.",
    "Gunakan angka spesifik, hindari kata kabur seperti 'cukup baik' atau 'beberapa'.",
    "Jangan menampilkan ID project atau ID pengguna dalam teks. Untuk attention, isi projectId dengan ID project dari data agar aplikasi dapat memasangkan nama project.",

    // Format
    "Keluarkan JSON saja dengan bentuk { condition: string, attention: [{ projectId: number, insight: string, action: string }], review: [string], blockerPattern: string, dataQualityNote: string }.",
  ],
};

    const endpoint = new URL("chat/completions", `${process.env.LLM_BASE_URL.replace(/\/+$/, "")}/`);
    if (endpoint.protocol !== "https:") throw new Error("AI endpoint must use HTTPS");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.LLM_API_KEY}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model: process.env.LLM_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: "Kamu analis portofolio project. Buat AI Summary dashboard dalam bahasa Indonesia yang SINGKAT, spesifik, dan bisa ditindaklanjuti. " +
          "Pembaca adalah manajer yang hanya punya waktu beberapa detik: utamakan hal yang perlu tindakan, bukan membacakan ulang data. " +
          "Bagian yang tidak punya temuan harus dikosongkan, bukan diisi kalimat 'tidak ada'. " +
          "Data mencakup seluruh project, update, tahapan, riwayat, dan metadata dokumen; gunakan semuanya sebagai bahan analisis, tapi hanya tampilkan yang paling penting. " +
          "Balas dengan JSON valid saja.", },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Model API returned ${response.status}`);
    const completion = await response.json();
    const choice = completion.choices?.[0];
    if (choice?.finish_reason === "length") throw new Error("DeepSeek response was truncated; increase max_tokens");
    const content = choice?.message?.content;
    if (typeof content !== "string" || !content.trim()) throw new Error("DeepSeek returned empty JSON content");
    const summary = JSON.parse(content);
    if (!summary || typeof summary.condition !== "string" || !Array.isArray(summary.attention) || !Array.isArray(summary.review) || typeof summary.blockerPattern !== "string" || typeof summary.dataQualityNote !== "string") throw new Error("Invalid AI summary format");
    const condition = safeText(summary.condition, 1200);
    const blockerPattern = safeText(summary.blockerPattern, 1200);
    const dataQualityNote = safeText(summary.dataQualityNote, 500);
    if (!condition) throw new Error("AI summary condition is empty");

    const attention = summary.attention.slice(0, 3).flatMap((item) => {
      const project = Number.isInteger(item?.projectId) ? projectDetails.get(item.projectId) : null;
      const insight = safeText(item?.insight);
      const action = safeText(item?.action);
      return project && insight && action ? [{ nama: project.nama, prioritas: project.prioritas, status: project.status, insight, action }] : [];
    });
    const review = summary.review.slice(0, 2).map((item) => safeText(item, 500)).filter(Boolean);
    const result = {
      condition,
      attention,
      blockerPattern,
      review,
      dataQualityNote,
      totalProjects,
      statusCounts,
      highPriorityOnHold: highHoldCount,
      period: { start: periodStartDate, end: today },
      blockerUpdateCount: weeklyBlockers.length,
      completedProjectCount: changesThisPeriod.completedProjectIds.length,
      stageChangeProjectCount: new Set(changesThisPeriod.committeeStageAdvances.map((change) => change.projectId)).size,
    };
    const generatedAt = new Date();
    const isStale = hashAiSummaryProjects(await getAiSummaryProjects()) !== dataHash;
    const saved = await prisma.dashboardAiSummary.upsert({
      where: { key: aiSummaryKey },
      create: { key: aiSummaryKey, result, dataHash, dataAsOf: now, generatedAt },
      update: { result, dataHash, dataAsOf: now, generatedAt },
    });
    res.json({ success: true, data: { ...result, generatedAt: saved.generatedAt, dataAsOf: saved.dataAsOf, isStale } });
  } catch (err) {
    console.error("Dashboard AI summary failed:", err.message);
    const message = err.message.includes("truncated")
      ? "Summary terpotong oleh batas token. Naikkan max_tokens lalu coba lagi."
      : "Summary gagal dibuat. Coba lagi nanti.";
    res.status(502).json({ success: false, message });
  }
}
