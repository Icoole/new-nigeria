import { createServerFn } from "@tanstack/react-start";

const isElectionId = (v: unknown) => {
  const s = String(v ?? "");
  if (!/^[a-zA-Z0-9]{6,64}$/.test(s)) throw new Error("Invalid election id");
  return s;
};

/** Reads the newest unread EC8A sheets for an election and stores the numbers. */
export const sweepEc8a = createServerFn({ method: "POST" })
  .inputValidator(isElectionId)
  .handler(async ({ data: electionId }) => {
    const { sweepElection } = await import("./ec8a.server");
    return sweepElection(electionId);
  });

/** Aggregated party tallies counted from the sheets read so far. */
export const getEc8aTallies = createServerFn({ method: "GET" })
  .inputValidator(isElectionId)
  .handler(async ({ data: electionId }) => {
    const { fetchTallies } = await import("./ec8a.server");
    return fetchTallies(electionId);
  });
