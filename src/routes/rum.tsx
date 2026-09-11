import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getRumSnapshot, searchRumPus } from "@/lib/rum.functions";
import type { LgaRow, PartyTally, RumSnapshot } from "@/lib/rum.server";

const rumQuery = queryOptions({
  queryKey: ["rum", "snapshot"],
  queryFn: () => getRumSnapshot(),
  staleTime: 20_000,
  refetchInterval: 20_000,
  refetchIntervalInBackground: true,
});

export const Route = createFileRoute("/rum")({
  head: () => ({
    meta: [
      { title: "RUM — Osun Governorship Result Upload Monitor 2026" },
      {
        name: "description",
        content:
          "RUM: provisional, independent aggregation of INEC IReV Form EC8A uploads for the 2026 Osun governorship election — statewide tally, LGA and ward breakdown, coverage and integrity.",
      },
      { property: "og:title", content: "RUM — Osun Result Upload Monitor" },
      {
        property: "og:description",
        content:
          "Live provisional tally of INEC IReV EC8A uploads for Osun 2026: coverage, LGA/ward results and form integrity.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(rumQuery),
  component: RumPage,
});

const nf = (n: number) => n.toLocaleString("en-NG");
const pct = (n: number) => `${n.toFixed(1)}%`;

function RumPage() {
  const { data } = useSuspenseQuery(rumQuery);
  const [openLga, setOpenLga] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const search = useQuery({
    queryKey: ["rum", "search", submitted],
    queryFn: () => searchRumPus({ data: submitted }),
    enabled: submitted.trim().length >= 2,
    staleTime: 60_000,
  });

  const colorOf = useMemo(() => {
    const m = new Map(data.parties.map((p) => [p.code, p.color]));
    return (code: string | null) => (code ? (m.get(code) ?? "#8a8a8a") : "#8a8a8a");
  }, [data.parties]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold tracking-tight">
              RUM<span className="text-live">.</span>
            </p>
            <p className="mono-code text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
              Result Upload Monitor
            </p>
          </div>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground md:inline">
            Independent · Non-partisan
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-live">
            <span className="live-dot" aria-hidden="true" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            IReV feed
          </Link>
          <div className="mono-code text-right text-xs text-muted-foreground">
            <p>
              SOURCE <span className="text-foreground">INEC IReV</span>
            </p>
            <p>
              UPDATED{" "}
              <span className="text-foreground">
                {new Date(data.updatedAt).toLocaleString("en-NG", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="panel mt-6 flex flex-wrap items-center gap-3 p-4">
        <span className="rounded-md border border-live/40 px-2 py-1 mono-code text-[0.65rem] uppercase tracking-widest text-live">
          Live · Provisional
        </span>
        <p className="mono-code text-xs text-muted-foreground">
          Provisional aggregation of INEC's published EC8A forms. Only INEC declares a
          winner.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-6" aria-label="Statewide tally">
          <p className="mono-code text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            — Statewide tally · provisional
          </p>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">{data.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.subtitle}</p>

          <ShareBar parties={data.parties} others={data.others} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.parties.map((p, i) => (
              <PartyCard key={p.code} party={p} lead={i === 0} />
            ))}
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">OTHERS</p>
                  <p className="text-xs text-muted-foreground">Other parties</p>
                </div>
                <div className="text-right">
                  <p className="stat-value text-xl">{nf(data.others)}</p>
                  <p className="mono-code text-xs text-muted-foreground">
                    {pct(data.othersShare)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Valid votes counted
              </p>
              <p className="stat-value mt-1 text-3xl">{nf(data.validVotes)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Current lead
              </p>
              <p className="stat-value mt-1 text-3xl">
                {nf(data.lead.margin)}{" "}
                <span className="text-base text-muted-foreground">
                  · {data.lead.points.toFixed(1)} pts
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="panel p-6" aria-label="Coverage and integrity">
          <p className="mono-code text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            — Coverage · polling units reporting
          </p>
          <p className="stat-value mt-3 text-5xl text-live">
            {nf(data.coverage.uploaded)}
            <span className="text-3xl text-muted-foreground"> / {nf(data.coverage.totalPus)}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            polling units in · {pct(data.coverage.percent)} of total uploaded
          </p>

          <IntegrityBar integrity={data.integrity} />

          <div className="mt-6 border-t border-border pt-5">
            <p className="stat-value text-3xl text-live">
              {pct(data.integrity.countedPercent)}
            </p>
            <p className="text-sm text-muted-foreground">
              of uploaded forms counted toward the tally
            </p>
          </div>

          <ul className="mt-5 grid gap-1.5">
            {data.flagBreakdown.slice(0, 6).map((f) => (
              <li
                key={f.flag}
                className="mono-code flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>{f.flag.replace(/_/g, " ")}</span>
                <span className="text-foreground">{nf(f.count)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10" aria-label="Results by LGA">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <span className="mono-code rounded-md border border-border px-2 py-0.5 text-xs text-live">
              01
            </span>
            Results by LGA
          </h2>
          <p className="text-sm text-muted-foreground">
            Select an LGA to inspect its wards.
          </p>
        </div>

        <div className="panel mt-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Each party's share per area.{" "}
              <span className="rounded border border-live/40 px-1.5 py-0.5 mono-code text-[0.65rem] text-live">
                ✓ 25%
              </span>{" "}
              marks a party that has cleared the 25% threshold used for the two-thirds
              spread.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(query);
              }}
              className="flex gap-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search polling unit code or name…"
                className="w-64 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="Search polling unit"
              />
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                Search
              </button>
            </form>
          </div>

          {submitted.trim().length >= 2 ? (
            <div className="mt-4 rounded-xl border border-border p-4">
              <p className="mono-code text-xs uppercase tracking-widest text-muted-foreground">
                Polling-unit search · “{submitted}”
              </p>
              {search.isLoading ? (
                <p className="mt-3 text-sm text-muted-foreground">Searching…</p>
              ) : (search.data?.length ?? 0) === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No matching units.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {search.data!.map((pu) => (
                    <li key={pu.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{pu.name}</p>
                        <p className="mono-code truncate text-xs text-muted-foreground">
                          {pu.code} · {pu.ward} · {pu.lga}
                        </p>
                      </div>
                      <div className="mono-code flex flex-wrap gap-2 text-xs">
                        {data.parties.map((p) => (
                          <span key={p.code} className="text-muted-foreground">
                            <span style={{ color: p.color }}>{p.code}</span>{" "}
                            {nf(pu.votes[p.code] ?? 0)}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`mono-code rounded-full border px-2 py-0.5 text-[0.65rem] uppercase ${
                          pu.status === "counted"
                            ? "border-live/40 text-live"
                            : "border-flag/40 text-flag"
                        }`}
                      >
                        {pu.status}
                      </span>
                      {pu.sheetUrl ? (
                        <a
                          href={pu.sheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent"
                        >
                          EC8A
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <p className="mono-code mt-5 text-xs uppercase tracking-widest text-muted-foreground">
            {data.scope}
          </p>

          <ul className="mt-3 divide-y divide-border">
            {data.lgas.map((l) => (
              <LgaBlock
                key={l.name}
                lga={l}
                parties={data.parties}
                open={openLga === l.name}
                onToggle={() => setOpenLga(openLga === l.name ? null : l.name)}
                colorOf={colorOf}
              />
            ))}
          </ul>
        </div>
      </section>

      {data.replacements.length > 0 ? (
        <section className="panel mt-8 p-5" aria-label="Replaced forms">
          <h2 className="text-lg font-semibold">Replaced forms</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Polling units whose EC8A upload was swapped for a different scan after first
            publication.
          </p>
          <ul className="mono-code mt-3 grid gap-2 text-xs">
            {data.replacements.map((r) => (
              <li
                key={r.code}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2"
              >
                <span>
                  {r.code} · {r.ward}
                </span>
                <span className={r.leaderChanged ? "text-flag" : "text-muted-foreground"}>
                  {r.leaderChanged
                    ? `leader ${r.oldLeader ?? "—"} → ${r.newLeader ?? "—"}`
                    : "leader unchanged"}{" "}
                  · {r.ts}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        {data.note} Source data: INEC IReV via the public Osun open-tally export ·{" "}
        {data.hashtag}
      </footer>
    </main>
  );
}

function ShareBar({ parties, others }: { parties: PartyTally[]; others: number }) {
  const total = parties.reduce((s, p) => s + p.votes, 0) + others;
  if (!total) return null;
  return (
    <div className="mt-5 flex h-11 w-full overflow-hidden rounded-lg">
      {parties.map((p) => (
        <div
          key={p.code}
          className="flex items-center justify-center text-xs font-semibold text-white"
          style={{ width: `${(p.votes / total) * 100}%`, backgroundColor: p.color }}
          title={`${p.code} ${((p.votes / total) * 100).toFixed(1)}%`}
        >
          {p.votes / total > 0.06 ? `${p.code} ${Math.round((p.votes / total) * 100)}%` : ""}
        </div>
      ))}
      <div className="flex-1 bg-surface-2" title="Others" />
    </div>
  );
}

function PartyCard({ party, lead }: { party: PartyTally; lead: boolean }) {
  return (
    <div
      className="rounded-xl border bg-surface-2 p-4"
      style={{ borderColor: lead ? party.color : undefined }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 shrink-0 rounded"
              style={{ backgroundColor: party.color }}
              aria-hidden="true"
            />
            <p className="text-sm font-semibold">{party.code}</p>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {party.candidate || party.name}
          </p>
          {lead ? (
            <p className="mono-code mt-1 text-[0.65rem] uppercase tracking-wider text-live">
              Provisional lead
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="stat-value text-xl">{nf(party.votes)}</p>
          <p className="mono-code text-xs text-muted-foreground">{pct(party.share)}</p>
        </div>
      </div>
    </div>
  );
}

function IntegrityBar({ integrity }: { integrity: RumSnapshot["integrity"] }) {
  const segs = [
    { label: "Clean", value: integrity.clean, color: "oklch(0.74 0.16 155)" },
    { label: "Flagged", value: integrity.flagged, color: "oklch(0.78 0.15 75)" },
    { label: "Queued", value: integrity.queued, color: "oklch(0.66 0.16 260)" },
    { label: "Processing", value: integrity.processing, color: "oklch(0.62 0.18 300)" },
    { label: "Retrying", value: integrity.retrying, color: "oklch(0.74 0.15 60)" },
    { label: "Excluded", value: integrity.excluded, color: "oklch(0.66 0.19 20)" },
  ];
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="mt-5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
        {segs.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      <ul className="mono-code mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label} <span className="text-foreground">{nf(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LgaBlock({
  lga,
  parties,
  open,
  onToggle,
  colorOf,
}: {
  lga: LgaRow;
  parties: PartyTally[];
  open: boolean;
  onToggle: () => void;
  colorOf: (code: string | null) => string;
}) {
  const ranked = [...parties]
    .map((p) => ({ ...p, v: lga.votes[p.code] ?? 0 }))
    .sort((a, b) => b.v - a.v);

  return (
    <li className="py-4">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{lga.name}</p>
            <p className="mono-code text-xs text-muted-foreground">
              {lga.pusIn} of {lga.pusTotal} PUs in · leader{" "}
              <span style={{ color: colorOf(lga.leader) }}>{lga.leader ?? "—"}</span>
            </p>
          </div>
          <span
            className={`mono-code rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider ${
              lga.band === "safe"
                ? "border-live/40 text-live"
                : "border-flag/40 text-flag"
            }`}
          >
            {lga.band}
          </span>
        </div>

        <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
          {ranked.map((p) => (
            <div
              key={p.code}
              style={{
                width: `${lga.total ? (p.v / lga.total) * 100 : 0}%`,
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ranked.map((p) => {
            const share = lga.total ? (p.v / lga.total) * 100 : 0;
            return (
              <span
                key={p.code}
                className="mono-code flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1 text-xs"
              >
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: p.color }}
                  aria-hidden="true"
                />
                <span className="font-semibold">{p.code}</span>
                <span>{share.toFixed(0)}%</span>
                <span className="text-muted-foreground">{nf(p.v)}</span>
                {share >= 25 ? <span className="text-live">✓25%</span> : null}
              </span>
            );
          })}
          {lga.other > 0 ? (
            <span className="mono-code rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
              OTHERS {nf(lga.other)}
            </span>
          ) : null}
        </div>
      </button>

      {open ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Ward</th>
                <th className="px-3 py-2 font-medium">PUs</th>
                {parties.map((p) => (
                  <th key={p.code} className="px-3 py-2 font-medium" style={{ color: p.color }}>
                    {p.code}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Others</th>
                <th className="px-3 py-2 font-medium">Leader</th>
              </tr>
            </thead>
            <tbody className="mono-code">
              {lga.wards.map((w) => (
                <tr key={w.name} className="border-t border-border">
                  <td className="px-3 py-2 font-sans">{w.name}</td>
                  <td className="px-3 py-2">{w.pus}</td>
                  {parties.map((p) => (
                    <td key={p.code} className="px-3 py-2">
                      {nf(w.votes[p.code] ?? 0)}
                    </td>
                  ))}
                  <td className="px-3 py-2">{nf(w.other)}</td>
                  <td className="px-3 py-2" style={{ color: colorOf(w.leader) }}>
                    {w.leader ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </li>
  );
}
