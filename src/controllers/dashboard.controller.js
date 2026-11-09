import prisma from "../lib/prisma.js";
import { STATUS, TAHAP, STATUS_TAHAPAN } from "../constants/enums.js";
import { todayWIB } from "../lib/dates.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayOffset(date, today) {
  if (!date) return null;
  const target = new Date(date).toISOString().slice(0, 10);
  return Math.round((Date.parse(`${target}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
}

function safeText(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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

export async function createAiSummary(req, res) {
  if (!process.env.LLM_BASE_URL || !process.env.LLM_API_KEY || !process.env.LLM_MODEL) {
    return res.status(503).json({ success: false, message: "Summary gagal dibuat. Konfigurasi AI belum lengkap." });
  }

  try {
    const now = new Date();
    const today = todayWIB();
    const periodStartDate = new Date(Date.parse(`${today}T00:00:00Z`) - 6 * DAY_MS).toISOString().slice(0, 10);
    const periodStart = new Date(`${periodStartDate}T00:00:00+07:00`);
    const [totalProjects, statusGroups, priorityGroups, stageGroups, activeProjects, highHoldCount, blockerUpdateCount, completedProjectUpdates, stageChangeProjects] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.project.groupBy({ by: ["prioritas"], _count: { _all: true } }),
      prisma.projectStage.groupBy({ by: ["tahap", "status"], _count: { _all: true } }),
      prisma.project.findMany({
        where: { status: { notIn: ["DRAFT", "SELESAI"] } },
        orderBy: [{ prioritas: "desc" }, { updatedAt: "desc" }, { id: "asc" }],
        select: {
          id: true, status: true, prioritas: true, createdAt: true, targetGoLive: true,
          stages: { select: { tahap: true, status: true, tanggalRencana: true } },
          updates: { orderBy: { tanggalInput: "desc" }, take: 1, select: { tanggalInput: true } },
        },
      }),
      prisma.project.count({ where: { status: "ON_HOLD", prioritas: "HIGH" } }),
      prisma.projectUpdate.count({ where: { tanggalInput: { gte: periodStart, lte: now }, kendala: { not: null } } }),
      prisma.projectUpdate.groupBy({ by: ["projectId"], where: { tanggalInput: { gte: periodStart, lte: now }, status: "SELESAI" } }),
      prisma.projectStageHistory.groupBy({ by: ["projectId"], where: { changedAt: { gte: periodStart, lte: now } } }),
    ]);

    const statusCounts = Object.fromEntries(STATUS.map((status) => [status, 0]));
    for (const group of statusGroups) statusCounts[group.status] = group._count._all;
    const priorityCounts = Object.fromEntries(["HIGH", "MEDIUM", "LOW"].map((priority) => [priority, 0]));
    for (const group of priorityGroups) priorityCounts[group.prioritas] = group._count._all;
    const stageCounts = Object.fromEntries(TAHAP.map((tahap) => [tahap, Object.fromEntries(STATUS_TAHAPAN.map((status) => [status, 0]))]));
    for (const group of stageGroups) stageCounts[group.tahap][group.status] = group._count._all;

    const projectDetails = new Map();
    const projects = activeProjects.map((project, index) => {
      const projectRef = `P${String(index + 1).padStart(2, "0")}`;
      const lastProgressAt = project.updates[0]?.tanggalInput ?? null;
      projectDetails.set(projectRef, { nama: project.nama, prioritas: project.prioritas, status: project.status });
      return {
        projectRef,
        status: project.status,
        priority: project.prioritas,
        hoursSinceLastProgress: lastProgressAt ? Math.max(0, Math.floor((now - lastProgressAt) / 3600000)) : null,
        daysSinceUpload: Math.max(0, Math.floor((now - project.createdAt) / DAY_MS)),
        targetGoLiveInDays: dayOffset(project.targetGoLive, today),
        committeeStages: project.stages.map((stage) => ({
          stage: stage.tahap,
          status: stage.status,
          plannedInDays: dayOffset(stage.tanggalRencana, today),
        })),
      };
    });

    const input = {
      asOf: now.toISOString(),
      timezone: "Asia/Jakarta",
      period: { start: periodStartDate, end: today },
      portfolio: { totalProjects, statusCounts, priorityCounts, highPriorityOnHold: highHoldCount, committeeStageCounts: stageCounts },
      activeProjects: projects,
      constraints: [
        "projectRef adalah samaran; jangan menebak atau membuat nama project/PIC.",
        "Jangan menyebut pola atau penyebab kendala karena teks kendala tidak disertakan.",
        "Gunakan hanya angka dan fakta yang ada. Status DRAFT dan SELESAI hanya ada di agregat, tidak masuk daftar project aktif.",
        "Kondisi umum harus 1-2 kalimat kualitatif dan tidak menyebut angka portofolio; angka status akan ditampilkan langsung dari hasil hitung aplikasi.",
        "Jika hoursSinceLastProgress null, project belum punya update progress; daysSinceUpload adalah umur sejak diunggah.",
        "Jarak jadwal dihitung dari tanggal acuan Asia/Jakarta; gunakan nilai relatif yang tersedia dan jangan membuat tanggal absolut.",
        "Berikan maksimal 3 perhatian terpenting. Jika tidak ada yang perlu perhatian khusus, kembalikan attention sebagai array kosong.",
        "Keluarkan JSON saja dengan bentuk { condition: string, attention: [{ projectRef: string, insight: string, recommendation: string }] }.",
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
        messages: [
          { role: "system", content: "Kamu analis portofolio project. Buat AI Summary dashboard singkat dalam bahasa Indonesia. Jangan mengarang atau menyimpulkan sebab yang tidak tersedia." },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Model API returned ${response.status}`);
    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;
    const summary = JSON.parse(content);
    if (!summary || typeof summary.condition !== "string" || !Array.isArray(summary.attention)) throw new Error("Invalid AI summary format");
    const condition = safeText(summary.condition, 1200);
    if (!condition) throw new Error("AI summary condition is empty");

    const attention = summary.attention.slice(0, 3).flatMap((item) => {
      const project = projectDetails.get(item?.projectRef);
      const insight = safeText(item?.insight);
      const recommendation = safeText(item?.recommendation);
      return project && insight && recommendation ? [{ ...project, insight, recommendation }] : [];
    });
    res.json({
      success: true,
      data: {
        condition,
        attention,
        totalProjects,
        statusCounts,
        highPriorityOnHold: highHoldCount,
        period: { start: periodStartDate, end: today },
        blockerUpdateCount,
        completedProjectCount: completedProjectUpdates.length,
        stageChangeProjectCount: stageChangeProjects.length,
        asOf: now.toISOString(),
      },
    });
  } catch (err) {
    console.error("Dashboard AI summary failed:", err.message);
    res.status(502).json({ success: false, message: "Summary gagal dibuat. Coba lagi nanti." });
  }
}
