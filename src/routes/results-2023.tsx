import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  PARTY_CODES,
  PARTY_META,
  STATE_RESULTS_2023,
  leaderOf,
  nationalTotals,
  spreadCount,
  stateTotal,
  type PartyCode,
} from "@/lib/results2023";

export const Route = createFileRoute("/results-2023")({
  head: () => ({
    meta: [
      { title: "2023 Presidential Results Map | TogetherNigeria" },
      {
        name: "description",
        content:
          "Interactive 2023 Nigerian presidential results: declared state-level votes for APC, PDP, LP and NNPP, leaders by state, turnout and the 25% spread rule.",
      },
      { property: "og:title", content: "2023 Presidential Results — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Declared 2023 presidential votes by state for APC, PDP, LP and NNPP with the 25% spread rule.",
      },
      { property: "og:url", content: "/results-2023" },
    ],
    links: [{ rel: "canonical", href: "/results-2023" }],
  }),
  component: Results2023,
});

const nf = (n: number) => n.toLocaleString("en-NG");

function Results2023() {
  const [sort, setSort] = useState<"state" | "votes">("votes");
  const [zone, setZone] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const zones = useMemo(
    () => ["All", ...Array.from(new Set(STATE_RESULTS_2023.map((s) => s.zone)))],
    [],
  );

  const rows = useMemo(() => {
    const list = STATE_RESULTS_2023.filter((s) => zone === "All" || s.zone === zone);
    return [...list].sort((a, b) =>
      sort === "state"
        ? a.state.localeCompare(b.state)
        : stateTotal(b) - stateTotal(a),
    );
  }, [sort, zone]);

  const totals = nationalTotals(STATE_RESULTS_2023);
  const grand = PARTY_CODES.reduce((s, c) => s + totals[c], 0);
  const detail = STATE_RESULTS_2023.find((s) => s.state === selected) ?? null;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Public dataset
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">2023 presidential results</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Declared state-level votes for the four leading parties. Click any state tile to
        open its breakdown, leader and share of votes cast.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PARTY_CODES.map((c) => (
          <div key={c} className="panel p-5">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: PARTY_META[c].color }}
              />
              <p className="mono-code text-sm font-semibold">{c}</p>
            </div>
            <p className="stat-value mt-2 text-3xl">{nf(totals[c])}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {((totals[c] / grand) * 100).toFixed(2)}% · {PARTY_META[c].candidate}
            </p>
            <p className="mono-code mt-2 text-xs text-pending">
              25% spread: {spreadCount(STATE_RESULTS_2023, c)} / 37
            </p>
          </div>
        ))}
      </section>

      <section className="panel mt-8 p-5" aria-label="State map grid">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Leader by state</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              aria-label="Filter by zone"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
            >
              {zones.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "state" | "votes")}
              aria-label="Sort states"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
            >
              <option value="votes">Sort by votes cast</option>
              <option value="state">Sort A–Z</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {rows.map((s) => {
            const lead = leaderOf(s);
            const total = stateTotal(s);
            const share = (s.votes[lead] / total) * 100;
            return (
              <button
                key={s.state}
                onClick={() => setSelected(s.state)}
                className={`rounded-lg border p-3 text-left transition-transform hover:-translate-y-0.5 ${
                  selected === s.state ? "border-primary" : "border-border"
                }`}
                style={{ backgroundColor: `color-mix(in oklch, ${PARTY_META[lead].color} 18%, var(--surface))` }}
              >
                <p className="text-sm font-semibold">{s.state}</p>
                <p className="mono-code mt-1 text-xs" style={{ color: PARTY_META[lead].color }}>
                  {lead} {share.toFixed(1)}%
                </p>
                <p className="mono-code mt-1 text-[0.65rem] text-muted-foreground">
                  {nf(total)} votes
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {detail ? (
        <section className="panel mt-6 p-5" aria-label="State detail">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {detail.state} · {detail.zone}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="rounded-md border border-border px-3 py-1 text-xs hover:bg-accent"
            >
              Close
            </button>
          </div>
          <p className="mono-code mt-1 text-xs text-muted-foreground">
            Registered {nf(detail.registered)} · votes cast {nf(stateTotal(detail))} ·
            turnout {((stateTotal(detail) / detail.registered) * 100).toFixed(1)}%
          </p>
          <ul className="mt-4 grid gap-2">
            {PARTY_CODES.map((c) => {
              const share = (detail.votes[c] / stateTotal(detail)) * 100;
              return (
                <li key={c} className="grid grid-cols-[3rem_1fr_6rem] items-center gap-3">
                  <span className="mono-code text-sm font-semibold">{c}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${share}%`,
                        backgroundColor: PARTY_META[c].color,
                      }}
                    />
                  </span>
                  <span className="mono-code text-right text-xs">
                    {nf(detail.votes[c])} · {share.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="panel mt-6 overflow-x-auto p-5" aria-label="Full state table">
        <h2 className="text-lg font-semibold">Full state table</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4 font-medium">State</th>
              {PARTY_CODES.map((c) => (
                <th key={c} className="py-2 pr-4 font-medium">
                  {c}
                </th>
              ))}
              <th className="py-2 pr-4 font-medium">Total</th>
              <th className="py-2 font-medium">Leader</th>
            </tr>
          </thead>
          <tbody className="mono-code">
            {rows.map((s) => {
              const lead: PartyCode = leaderOf(s);
              return (
                <tr key={s.state} className="border-t border-border">
                  <td className="py-2 pr-4 font-sans">{s.state}</td>
                  {PARTY_CODES.map((c) => (
                    <td key={c} className="py-2 pr-4">
                      {nf(s.votes[c])}
                    </td>
                  ))}
                  <td className="py-2 pr-4">{nf(stateTotal(s))}</td>
                  <td className="py-2" style={{ color: PARTY_META[lead].color }}>
                    {lead}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Figures are the declared state totals for the four leading parties. The
        authoritative record remains INEC's declaration and the polling-unit Form EC8A
        scans published on IReV.
      </p>
    </main>
  );
}
