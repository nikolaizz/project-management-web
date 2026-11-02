import prisma from "../lib/prisma.js";
import { STATUS, TAHAP, STATUS_TAHAPAN } from "../constants/enums.js";

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
