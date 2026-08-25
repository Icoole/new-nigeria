import { createServerFn } from "@tanstack/react-start";

export const getElections = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchElections } = await import("./irev.server");
  return fetchElections();
});

export const getElectionFeed = createServerFn({ method: "GET" })
  .inputValidator((electionId: string) => electionId)
  .handler(async ({ data: electionId }) => {
    const { fetchStats, fetchRecentUploads, fetchLgas } = await import("./irev.server");
    const [stats, uploads, lgas] = await Promise.all([
      fetchStats(electionId),
      fetchRecentUploads(electionId),
      fetchLgas(electionId),
    ]);
    return { stats, uploads, lgas, fetchedAt: new Date().toISOString() };
  });
