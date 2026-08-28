import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  PARTY_CODES,
  PARTY_META,
  STATE_RESULTS_2023,
  stateTotal,
  type PartyCode,
} from "@/lib/results2023";

export const Route = createFileRoute("/aso-rock")({
  head: () => ({
    meta: [
      { title: "Path to Aso Rock — 2027 presidential simulator | TogetherNigeria" },
      {
        name: "description",
        content:
          "Start from the declared 2023 presidential result, shift state vote shares and turnout, and watch the national vote and the 25% spread rule in 24 states plus the FCT.",
      },
      { property: "og:title", content: "Path to Aso Rock — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Interactive 2027 presidential path builder with the national vote and 25% spread rule.",
      },
      { property: "og:url", content: "/aso-rock" },
    ],
    links: [{ rel: "canonical", href: "/aso-rock" }],
  }),
  component: AsoRock,
});

const nf = (n: number) => n.toLocaleString("en-NG");

type Swing = Record<string, number>; // state -> percentage points shifted

function AsoRock() {
  const [party, setParty] = useState<PartyCode>("APC");
  const [swing, setSwing] = useState<Swing>({});
  const [turnout, setTurnout] = useState(0); // % change in votes cast nationally

  const model = useMemo(() => {
    const totals: Record<PartyCode, number> = { APC: 0, PDP: 0, LP: 0, NNPP: 0 };
    const perState = STATE_RESULTS_2023.map((s) => {
      const base = stateTotal(s);
      const cast = Math.round(base * (1 + turnout / 100));
      const shift = swing[s.state] ?? 0;
      const shares = {} as Record<PartyCode, number>;
      const baseShare = {} as Record<PartyCode, number>;
      for (const c of PARTY_CODES) baseShare[c] = base ? s.votes[c] / base : 0;

      const gain = Math.max(-baseShare[party], Math.min(1 - baseShare[party], shift / 100));
      const others = PARTY_CODES.filter((c) => c !== party);
      const otherTotal = others.reduce((a, c) => a + baseShare[c], 0);
      shares[party] = baseShare[party] + gain;
      for (const c of others) {
        shares[c] = otherTotal > 0 ? baseShare[c] - gain * (baseShare[c] / otherTotal) : 0;
      }
      const votes = {} as Record<PartyCode, number>;
      for (const c of PARTY_CODES) {
        votes[c] = Math.max(0, Math.round(shares[c] * cast));
        totals[c] += votes[c];
      }
      return { state: s.state, zone: s.zone, cast, votes, shares };
    });

    const grand = PARTY_CODES.reduce((a, c) => a + totals[c], 0);
    const spread = {} as Record<PartyCode, number>;
    for (const c of PARTY_CODES) {
      spread[c] = perState.filter((p) => p.shares[c] >= 0.25).length;
    }
    return { perState, totals, grand, spread };
  }, [party, swing, turnout]);

  const winner = PARTY_CODES.reduce((a, b) =>
    model.totals[b] > model.totals[a] ? b : a,
  );
  const meetsSpread = model.spread[winner] >= 25;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-pending">
        Free interactive
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Path to Aso Rock</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Start with the declared 2023 presidential result. Pick a party, move its share in
        any state, adjust national turnout, and watch both winning conditions: the highest
        national vote, and at least 25% in two-thirds of the states plus the FCT (25 of
        37).
      </p>

      <section className="panel mt-8 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Party you are moving:</span>
          {PARTY_CODES.map((c) => (
            <button
              key={c}
              onClick={() => setParty(c)}
              className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
                party === c ? "border-primary bg-accent" : "border-border"
              }`}
              style={{ color: PARTY_META[c].color }}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => {
              setSwing({});
              setTurnout(0);
            }}
            className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Reset to 2023
          </button>
        </div>

        <label className="mt-5 block text-sm">
          National turnout change: <span className="mono-code">{turnout > 0 ? "+" : ""}{turnout}%</span>
          <input
            type="range"
            min={-30}
            max={40}
            value={turnout}
            onChange={(e) => setTurnout(Number(e.target.value))}
            className="mt-2 w-full accent-[oklch(0.74_0.16_155)]"
          />
        </label>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Projected national vote</h2>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-2">
            {PARTY_CODES.map((c) => (
              <div
                key={c}
                style={{
                  width: `${(model.totals[c] / model.grand) * 100}%`,
                  backgroundColor: PARTY_META[c].color,
                }}
              />
            ))}
          </div>
          <ul className="mt-4 grid gap-2">
            {[...PARTY_CODES]
              .sort((a, b) => model.totals[b] - model.totals[a])
              .map((c) => (
                <li key={c} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: PARTY_META[c].color }}
                    />
                    <span className="mono-code text-sm font-semibold">{c}</span>
                    <span className="text-xs text-muted-foreground">
                      {PARTY_META[c].candidate}
                    </span>
                  </span>
                  <span className="mono-code text-sm">
                    {nf(model.totals[c])} · {((model.totals[c] / model.grand) * 100).toFixed(2)}%
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Winning conditions</h2>
          <p className="mt-3 text-sm text-muted-foreground">Leading nationally</p>
          <p className="stat-value text-3xl" style={{ color: PARTY_META[winner].color }}>
            {winner}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            25% spread rule (needs 25 of 37)
          </p>
          <div className="mt-2 grid gap-2">
            {PARTY_CODES.map((c) => (
              <div key={c} className="flex items-center gap-3">
                <span className="mono-code w-12 text-sm">{c}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(model.spread[c] / 37) * 100}%`,
                      backgroundColor: PARTY_META[c].color,
                    }}
                  />
                </span>
                <span className="mono-code w-16 text-right text-xs">
                  {model.spread[c]}/37
                </span>
              </div>
            ))}
          </div>
          <p
            className={`mt-5 rounded-lg px-3 py-2 text-sm ${
              meetsSpread ? "bg-live/10 text-live" : "bg-flag/10 text-flag"
            }`}
          >
            {meetsSpread
              ? `${winner} leads nationally and clears 25% in ${model.spread[winner]} states — outright win.`
              : `${winner} leads nationally but only clears 25% in ${model.spread[winner]} states — this path triggers a run-off.`}
          </p>
        </div>
      </section>

      <section className="panel mt-6 p-5" aria-label="State swing controls">
        <h2 className="text-lg font-semibold">Move {party} state by state</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Each slider adds or removes percentage points for {party}, redistributed
          proportionally among the other parties in that state.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {model.perState.map((s) => (
            <div key={s.state} className="rounded-lg bg-surface-2 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{s.state}</p>
                <p className="mono-code text-xs" style={{ color: PARTY_META[party].color }}>
                  {(s.shares[party] * 100).toFixed(1)}%
                </p>
              </div>
              <input
                type="range"
                min={-40}
                max={40}
                value={swing[s.state] ?? 0}
                onChange={(e) =>
                  setSwing((prev) => ({ ...prev, [s.state]: Number(e.target.value) }))
                }
                aria-label={`${party} swing in ${s.state}`}
                className="mt-2 w-full accent-[oklch(0.74_0.16_155)]"
              />
              <p className="mono-code mt-1 text-[0.65rem] text-muted-foreground">
                swing {(swing[s.state] ?? 0) > 0 ? "+" : ""}
                {swing[s.state] ?? 0} pts · {nf(s.votes[party])} votes
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
