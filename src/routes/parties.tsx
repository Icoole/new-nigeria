import { createFileRoute, Link } from "@tanstack/react-router";

import { PARTIES } from "@/lib/parties";
import {
  PARTY_CODES,
  STATE_RESULTS_2023,
  nationalTotals,
  spreadCount,
  type PartyCode,
} from "@/lib/results2023";

export const Route = createFileRoute("/parties")({
  head: () => ({
    meta: [
      { title: "Parties & Candidates — all 18 INEC parties | TogetherNigeria" },
      {
        name: "description",
        content:
          "Every political party registered with INEC, the presidential candidate and running mate each fielded in 2023, party colours used on Form EC8A and their declared national vote.",
      },
      { property: "og:title", content: "Parties & Candidates — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "All 18 INEC-registered parties with candidates, running mates and declared national votes.",
      },
      { property: "og:url", content: "/parties" },
    ],
    links: [{ rel: "canonical", href: "/parties" }],
  }),
  component: PartiesPage,
});

const nf = (n: number) => n.toLocaleString("en-NG");

function PartiesPage() {
  const totals = nationalTotals(STATE_RESULTS_2023);
  const grand = PARTY_CODES.reduce((s, c) => s + totals[c], 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Register of parties
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Parties and candidates</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Every party currently registered with INEC, with the presidential candidate and
        running mate it fielded at the last general election. The colour beside each party
        is the one used across the monitor, the map and the ward-level tallies.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Leading parties — declared national vote
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PARTY_CODES.map((code) => {
            const party = PARTIES.find((p) => p.code === code)!;
            const votes = totals[code];
            const share = grand ? (votes / grand) * 100 : 0;
            return (
              <article key={code} className="panel p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: party.color }}
                    aria-hidden="true"
                  />
                  <p className="font-display text-lg font-bold">{code}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{party.name}</p>
                <p className="mt-3 text-sm font-semibold">{party.candidate2023}</p>
                <p className="text-xs text-muted-foreground">
                  Running mate: {party.runningMate2023}
                </p>
                <p className="mono-code mt-3 text-lg">{nf(votes)}</p>
                <p className="text-xs text-muted-foreground">
                  {share.toFixed(1)}% · 25% in {spreadCount(STATE_RESULTS_2023, code as PartyCode)}{" "}
                  states
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          All {PARTIES.length} registered parties
        </h2>
        <div className="panel mt-3 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Full name</th>
                <th className="px-4 py-3">Presidential candidate</th>
                <th className="px-4 py-3">Running mate</th>
              </tr>
            </thead>
            <tbody>
              {PARTIES.map((p) => (
                <tr key={p.code} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: p.color }}
                        aria-hidden="true"
                      />
                      {p.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.name}</td>
                  <td className="px-4 py-3">{p.candidate2023}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.runningMate2023}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/results-2023"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          See how they performed by state
        </Link>
        <Link
          to="/polling-units"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Open polling units by region
        </Link>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Candidate names follow INEC's published final list of presidential candidates.
        Vote figures are the declared national totals for the four leading parties; the
        authoritative record remains INEC's declaration and the polling-unit sheets on
        IReV.
      </p>
    </main>
  );
}
