import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getElections, getElectionFeed } from "@/lib/irev.functions";
import { PARTIES } from "@/lib/parties";

const electionsQuery = queryOptions({
  queryKey: ["irev", "elections"],
  queryFn: () => getElections(),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/monitor")({
  head: () => ({
    meta: [
      { title: "The Monitor — Live IReV Upload Feed | TogetherNigeria" },
      {
        name: "description",
        content:
          "Real-time feed of INEC IReV polling-unit uploads: coverage, Form EC8A sheets, LGA breakdown and the full register of contesting parties.",
      },
      { property: "og:title", content: "The Monitor — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Real-time INEC IReV polling-unit uploads, Form EC8A sheets and coverage tracking.",
      },
    ],
    links: [{ rel: "canonical", href: "/monitor" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(electionsQuery),
  component: Dashboard,
});

function nf(n: number) {
  return n.toLocaleString("en-NG");
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Dashboard() {
  const { data: elections } = useSuspenseQuery(electionsQuery);
  const [electionId, setElectionId] = useState(elections[0]?.id ?? "");
  const [clock, setClock] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const feed = useQuery({
    queryKey: ["irev", "feed", electionId],
    queryFn: () => getElectionFeed({ data: electionId }),
    enabled: Boolean(electionId),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const active = elections.find((e) => e.id === electionId) ?? elections[0];
  const stats = feed.data?.stats;
  const uploads = feed.data?.uploads ?? [];
  const lgas = feed.data?.lgas ?? [];

  const lgaLeaders = useMemo(
    () => [...lgas].sort((a, b) => b.registered - a.registered).slice(0, 12),
    [lgas],
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="live-dot" aria-hidden="true" />
            Live from INEC IReV
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Result Upload Monitor</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Polling-unit result sheets (Form EC8A) as they land on the INEC IReV portal —
            coverage, replacements and the parties on the ballot.
          </p>
        </div>
        <div className="text-right">
          <p className="mono-code text-xs uppercase tracking-widest text-muted-foreground">
            Local time
          </p>
          <p className="stat-value mono-code text-2xl text-live">{clock}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-refresh every 60s · synced {timeAgo(feed.data?.fetchedAt ?? null)}
          </p>
        </div>
      </header>

      <section className="mt-8" aria-label="Select election">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {elections.map((e) => {
            const selected = e.id === electionId;
            return (
              <button
                key={e.id}
                onClick={() => setElectionId(e.id)}
                className={`min-w-56 shrink-0 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-accent"
                    : "border-border bg-surface hover:bg-surface-2"
                }`}
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {e.type}
                </p>
                <p className="mt-1 font-semibold">{e.area}</p>
                <p className="mono-code mt-1 text-xs text-muted-foreground">
                  {new Date(e.date).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {feed.isError ? (
        <p className="panel mt-6 p-5 text-sm text-destructive">
          Could not reach the IReV portal right now. Retrying automatically.
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Polling units" value={stats ? nf(stats.pollingUnits) : "—"} />
        <Stat
          label="EC8A sheets uploaded"
          value={stats ? nf(stats.sheetsUploaded) : "—"}
          tone="live"
        />
        <Stat
          label="Coverage"
          value={stats ? `${stats.coverage.toFixed(1)}%` : "—"}
          bar={stats?.coverage ?? 0}
        />
        <Stat
          label="Last upload"
          value={stats ? timeAgo(stats.lastUploadAt) : "—"}
          tone="pending"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5" aria-label="Live upload feed">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest polling-unit uploads</h2>
            <span className="mono-code text-xs text-muted-foreground">
              {active?.name ?? ""}
            </span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {uploads.length === 0 && feed.isLoading ? (
              <li className="py-6 text-sm text-muted-foreground">Loading feed…</li>
            ) : null}
            {uploads.map((u) => (
              <li key={u.id} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.puName}</p>
                  <p className="mono-code truncate text-xs text-muted-foreground">
                    {u.puCode} · {u.ward} · {u.lga}
                  </p>
                </div>
                {u.replaced ? (
                  <span className="rounded-full border border-flag/40 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-flag">
                    replaced
                  </span>
                ) : null}
                <span className="mono-code hidden text-xs text-muted-foreground sm:block">
                  {timeAgo(u.uploadedAt)}
                </span>
                {u.sheetUrl ? (
                  <a
                    href={u.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    EC8A
                  </a>
                ) : (
                  <span className="text-xs text-pending">pending</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5" aria-label="Parties on the ballot">
          <h2 className="text-lg font-semibold">Parties on the ballot</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            All {PARTIES.length} INEC-registered parties listed on IReV result sheets.
          </p>
          <ul className="mt-4 grid gap-2">
            {PARTIES.map((p) => (
              <li
                key={p.code}
                className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2"
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-md"
                  style={{ backgroundColor: p.color }}
                  aria-hidden="true"
                />
                <span className="mono-code w-14 shrink-0 text-sm font-semibold">
                  {p.code}
                </span>
                <span className="truncate text-sm text-muted-foreground">{p.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel mt-6 p-5" aria-label="LGA breakdown">
        <h2 className="text-lg font-semibold">Local government breakdown</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Registered voters, accreditation and votes as published by IReV per LGA. Values
          stay at zero until INEC releases collated figures for that area.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">LGA</th>
                <th className="py-2 pr-4 font-medium">Wards</th>
                <th className="py-2 pr-4 font-medium">Registered</th>
                <th className="py-2 pr-4 font-medium">Accredited</th>
                <th className="py-2 pr-4 font-medium">Valid</th>
                <th className="py-2 pr-4 font-medium">Rejected</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="mono-code">
              {lgaLeaders.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="py-2 pr-4 font-sans">{l.name}</td>
                  <td className="py-2 pr-4">{nf(l.wards)}</td>
                  <td className="py-2 pr-4">{nf(l.registered)}</td>
                  <td className="py-2 pr-4">{nf(l.accredited)}</td>
                  <td className="py-2 pr-4">{nf(l.validVotes)}</td>
                  <td className="py-2 pr-4">{nf(l.rejectedVotes)}</td>
                  <td className="py-2">{nf(l.totalVotes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        Source: INEC IReV public result portal. IReV publishes scanned Form EC8A sheets,
        not machine-readable per-party tallies — party vote figures must be read from the
        linked sheets.
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
  bar,
}: {
  label: string;
  value: string;
  tone?: "live" | "pending";
  bar?: number;
}) {
  return (
    <div className="panel p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p
        className={`stat-value mt-2 text-3xl ${
          tone === "live" ? "text-live" : tone === "pending" ? "text-pending" : ""
        }`}
      >
        {value}
      </p>
      {typeof bar === "number" ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, bar)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
