import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { buildContests, type ContestType } from "@/lib/contests";
import { getElections } from "@/lib/irev.functions";
import { PARTIES } from "@/lib/parties";
import {
  PARTY_CODES,
  PARTY_META,
  STATE_RESULTS_2023,
  leaderOf,
  stateTotal,
} from "@/lib/results2023";

const electionsQuery = queryOptions({
  queryKey: ["irev", "elections"],
  queryFn: () => getElections(),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/elections")({
  head: () => ({
    meta: [
      { title: "Election Hub — 2027 Nigerian contests | TogetherNigeria" },
      {
        name: "description",
        content:
          "Browse every 2027 Nigerian contest: presidential, governorship, Senate and House of Representatives, each with 2023 context, candidates, parties and live INEC upload links.",
      },
      { property: "og:title", content: "Election Hub — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Every 2027 presidential, governorship, Senate and House contest with 2023 results context and live INEC feeds.",
      },
      { property: "og:url", content: "/elections" },
    ],
    links: [{ rel: "canonical", href: "/elections" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(electionsQuery),
  component: ElectionHub,
});

const TYPES: (ContestType | "All")[] = [
  "All",
  "Presidential",
  "Governorship",
  "Senate",
  "House",
];

const nf = (n: number) => n.toLocaleString("en-NG");

function ElectionHub() {
  const all = useMemo(() => buildContests(), []);
  const { data: liveElections } = useSuspenseQuery(electionsQuery);
  const [type, setType] = useState<ContestType | "All">("All");
  const [zone, setZone] = useState("All");
  const [q, setQ] = useState("");

  const zones = useMemo(
    () => ["All", ...Array.from(new Set(all.map((c) => c.zone)))],
    [all],
  );

  const rows = all.filter(
    (c) =>
      (type === "All" || c.type === type) &&
      (zone === "All" || c.zone === zone) &&
      (q.trim() === "" ||
        `${c.title} ${c.state}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  const seats = rows.reduce((s, c) => s + c.seats, 0);
  const byState = useMemo(
    () => new Map(STATE_RESULTS_2023.map((r) => [r.state, r])),
    [],
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        2027 general election
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Election Hub</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        A record for every federal contest in the 2027 cycle. Each card carries the seats
        at stake, how the state voted at the last presidential election, and a route
        straight into the live INEC upload feed and the ward-by-ward polling-unit list.
      </p>

      <section className="panel mt-8 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Live on INEC IReV right now
        </h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {liveElections.slice(0, 6).map((e) => (
            <li key={e.id} className="rounded-md border border-border p-3">
              <p className="text-sm font-semibold">{e.name}</p>
              <p className="mono-code mt-1 text-xs text-muted-foreground">
                {e.type} · {e.area} · {new Date(e.date).toDateString()}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/polling-units"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Browse polling units
          </Link>
          <Link
            to="/monitor"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Live upload monitor
          </Link>
        </div>
      </section>

      <div className="panel mt-6 flex flex-wrap items-end gap-4 p-4">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                type === t
                  ? "border-primary bg-accent"
                  : "border-border text-muted-foreground hover:bg-surface-2"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          aria-label="Filter by geopolitical zone"
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a state or contest…"
          aria-label="Search contests"
          className="min-w-52 flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        />
        <p className="mono-code text-xs text-muted-foreground">
          {rows.length} records · {seats} seats
        </p>
      </div>

      <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => {
          const r = byState.get(c.state) ?? null;
          const leader = r ? leaderOf(r) : null;
          const cast = r ? stateTotal(r) : 0;
          return (
            <li key={c.id} className="panel flex flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {c.type} · {c.zone}
                  </p>
                  <h2 className="mt-1 text-base font-semibold">{c.title}</h2>
                </div>
                <span
                  className={`mono-code shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] uppercase ${
                    c.status === "Scheduled"
                      ? "border-live/40 text-live"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <p className="mono-code mt-3 text-xs text-muted-foreground">
                {c.seats} seat{c.seats > 1 ? "s" : ""} · {c.id}
              </p>

              {c.type === "Presidential" ? (
                <div className="mt-3 grid gap-1.5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Field at the last presidential election
                  </p>
                  {PARTY_CODES.map((code) => (
                    <p key={code} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: PARTY_META[code].color }}
                        aria-hidden="true"
                      />
                      <span className="font-semibold">{code}</span>
                      <span className="text-muted-foreground">
                        {PARTY_META[code].candidate}
                      </span>
                    </p>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    plus {PARTIES.length - 4} other registered parties —{" "}
                    <Link to="/parties" className="text-primary hover:underline">
                      see all candidates
                    </Link>
                  </p>
                </div>
              ) : r && leader ? (
                <div className="mt-3 grid gap-1 text-sm">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    2023 presidential vote in {c.state}
                  </p>
                  <p className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: PARTY_META[leader].color }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold">{leader}</span>
                    <span className="text-muted-foreground">
                      {PARTY_META[leader].candidate}
                    </span>
                  </p>
                  <p className="mono-code text-xs text-muted-foreground">
                    {nf(r.votes[leader])} of {nf(cast)} votes ·{" "}
                    {nf(r.registered)} registered
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2 pt-1">
                <Link
                  to="/polling-units"
                  className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
                >
                  Polling units
                </Link>
                <Link
                  to="/monitor"
                  className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
                >
                  Live uploads
                </Link>
                <Link
                  to="/parties"
                  className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
                >
                  Parties
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No contests match that filter.</p>
      ) : null}
    </main>
  );
}
