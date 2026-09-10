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

export const getElectionStructure = createServerFn({ method: "GET" })
  .inputValidator((electionId: string) => String(electionId ?? ""))
  .handler(async ({ data: electionId }) => {
    const { fetchElectionStructure } = await import("./irev.server");
    return fetchElectionStructure(electionId);
  });

export const getWardPus = createServerFn({ method: "GET" })
  .inputValidator((input: { electionId: string; wardId: string }) => input)
  .handler(async ({ data }) => {
    const { fetchWardPus } = await import("./irev.server");
    return fetchWardPus(data.electionId, data.wardId);
  });
