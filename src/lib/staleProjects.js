const DAY_MS = 24 * 60 * 60 * 1000;

export function staleProjectWhere(cutoff) {
  return {
    status: { notIn: ["DRAFT", "SELESAI"] },
    createdAt: { lt: cutoff },
    updates: { none: { tanggalInput: { gte: cutoff } } },
  };
}

export function latestProgressAt(project) {
  return project.updates[0]?.tanggalInput ?? null;
}

export function hoursWithoutProgress(project, now) {
  return Math.floor((now.getTime() - (latestProgressAt(project) ?? project.createdAt).getTime()) / (60 * 60 * 1000));
}

export function sortStaleProjects(projects) {
  return projects.sort((a, b) => {
    const lastA = latestProgressAt(a) ?? a.createdAt;
    const lastB = latestProgressAt(b) ?? b.createdAt;
    return lastA - lastB;
  });
}
