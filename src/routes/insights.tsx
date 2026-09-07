import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  PARTY_CODES,
  PARTY_META,
  STATE_RESULTS_2023,
  leaderOf,
  nationalTotals,
  stateTotal,
  type PartyCode,
} from "@/lib/results2023";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — 2023 election briefings | TogetherNigeria" },
      {
        name: "description",
        content:
          "Briefings from the declared 2023 presidential result: vote concentration, turnout by state, zone-level strength and how close each state was.",
      },
      { property: "og:title", content: "Insights — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Vote concentration, turnout and margin briefings built from the declared 2023 presidential result.",
      },
      { property: "og:url", content: "/insights" },
    ],
    links: [{ rel: "canonical", href: "/insights" }],
  }),
  component: Insights,
});

const nf = (n: number) => n.toLocaleString("en-NG");

function Insights() {
  const [focus, setFocus] = useState<PartyCode>("APC");

  const data = useMemo(() => {
    const totals = nationalTotals(STATE_RESULTS_2023);
    const grand = PARTY_CODES.reduce((s, c) => s + totals[c], 0);

    const rows = STATE_RESULTS_2023.map((s) => {
      const cast = stateTotal(s);
      const sorted = [...PARTY_CODES].sort((a, b) => s.votes[b] - s.votes[a]);
      const first = sorted[0] as PartyCode;
      const second = sorted[1] as PartyCode;
      const margin = ((s.votes[first] - s.votes[second]) / cast) * 100;
      return {
        state: s.state,
        zone: s.zone,
        cast,
        turnout: (cast / s.registered) * 100,
        leader: leaderOf(s),
        runnerUp: second,
        margin,
        share: (s.votes[focus] / cast) * 100,
        contribution: (s.votes[focus] / totals[focus]) * 100,
      };
    });

    const zones = new Map<string, Record<PartyCode, number>>();
    for (const s of STATE_RESULTS_2023) {
      const z = zones.get(s.zone) ?? { APC: 0, PDP: 0, LP: 0, NNPP: 0 };
      for (const c of PARTY_CODES) z[c] += s.votes[c];
      zones.set(s.zone, z);
    }

    const topTen = [...rows]
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 10);
    const concentration = topTen.reduce((a, r) => a + r.contribution, 0);

    return { totals, grand, rows, zones: [...zones.entries()], topTen, concentration };
  }, [focus]);

  const closest = [...data.rows].sort((a, b) => a.margin - b.margin).slice(0, 8);
  const turnoutTop = [...data.rows].sort((a, b) => b.turnout - a.turnout).slice(0, 8);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Insights
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">2023 election briefings</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Where each candidate's vote came from, how concentrated it was, which states were
        decided by a hair, and where turnout actually held up. Everything below is computed
        from the declared state totals — nothing is modelled.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Briefing focus:</span>
        {PARTY_CODES.map((c) => (
          <button
            key={c}
            onClick={() => setFocus(c)}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
              focus === c ? "border-primary bg-accent" : "border-border"
            }`}
            style={{ color: PARTY_META[c].color }}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={`${focus} national vote`}
          value={nf(data.totals[focus])}
          sub={`${((data.totals[focus] / data.grand) * 100).toFixed(2)}% of the four-party vote`}
        />
        <Stat
          label="Top 10 states share"
          value={`${data.concentration.toFixed(1)}%`}
          sub={`of every ${focus} vote came from ten states`}
        />
        <Stat
          label="States led"
          value={String(data.rows.filter((r) => r.leader === focus).length)}
          sub="out of 36 states and the FCT"
        />
        <Stat
          label="Candidate"
          value={PARTY_META[focus].candidate.split(" ").slice(-1)[0] ?? ""}
          sub={PARTY_META[focus].name}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Where the {focus} vote was concentrated</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Share of the party's national vote contributed by each state.
          </p>
          <ul className="mt-4 grid gap-2">
            {data.topTen.map((r) => (
              <li key={r.state} className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3">
                <span className="truncate text-sm">{r.state}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(r.contribution / (data.topTen[0]?.contribution || 1)) * 100}%`,
                      backgroundColor: PARTY_META[focus].color,
                    }}
                  />
                </span>
                <span className="mono-code text-right text-xs">
                  {r.contribution.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Zone strength</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Four-party vote split within each geopolitical zone.
          </p>
          <ul className="mt-4 grid gap-3">
            {data.zones.map(([zone, v]) => {
              const t = PARTY_CODES.reduce((a, c) => a + v[c], 0);
              return (
                <li key={zone}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{zone}</span>
                    <span className="mono-code text-xs text-muted-foreground">
                      {nf(t)} votes
                    </span>
                  </div>
                  <div className="mt-1 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
                    {PARTY_CODES.map((c) => (
                      <span
                        key={c}
                        style={{
                          width: `${(v[c] / t) * 100}%`,
                          backgroundColor: PARTY_META[c].color,
                        }}
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Closest states</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Margin between the leader and the runner-up, in points of votes cast.
          </p>
          <table className="mt-4 w-full text-sm">
            <tbody className="mono-code">
              {closest.map((r) => (
                <tr key={r.state} className="border-t border-border">
                  <td className="py-2 font-sans">{r.state}</td>
                  <td className="py-2" style={{ color: PARTY_META[r.leader].color }}>
                    {r.leader}
                  </td>
                  <td className="py-2 text-muted-foreground">over {r.runnerUp}</td>
                  <td className="py-2 text-right">{r.margin.toFixed(1)} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Highest turnout</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Votes cast for the four leading parties as a share of registered voters.
          </p>
          <table className="mt-4 w-full text-sm">
            <tbody className="mono-code">
              {turnoutTop.map((r) => (
                <tr key={r.state} className="border-t border-border">
                  <td className="py-2 font-sans">{r.state}</td>
                  <td className="py-2 text-muted-foreground">{nf(r.cast)}</td>
                  <td className="py-2 text-right text-primary">{r.turnout.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/results-2023"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Open the full 2023 map
        </Link>
        <Link
          to="/aso-rock"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Build a 2027 path
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="stat-value mt-2 text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
