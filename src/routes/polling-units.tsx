import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getElections, getElectionStructure, getWardPus } from "@/lib/irev.functions";

const electionsQuery = queryOptions({
  queryKey: ["irev", "elections"],
  queryFn: () => getElections(),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/polling-units")({
  head: () => ({
    meta: [
      { title: "Polling Units — every region, ward and unit | TogetherNigeria" },
      {
        name: "description",
        content:
          "Open any Nigerian election on INEC IReV and walk the full structure: local government area, ward and every polling unit with its scanned Form EC8A sheet.",
      },
      { property: "og:title", content: "Polling Units — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Drill from region to ward to every polling unit and open the scanned result sheet published on IReV.",
      },
      { property: "og:url", content: "/polling-units" },
    ],
    links: [{ rel: "canonical", href: "/polling-units" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(electionsQuery),
  component: PollingUnits,
});

function PollingUnits() {
  const { data: elections } = useSuspenseQuery(electionsQuery);
  const [electionId, setElectionId] = useState(elections[0]?.id ?? "");
  const [lgaId, setLgaId] = useState<string | null>(null);
  const [wardId, setWardId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const structure = useQuery({
    queryKey: ["irev", "structure", electionId],
    queryFn: () => getElectionStructure({ data: electionId }),
    enabled: Boolean(electionId),
    staleTime: 10 * 60_000,
  });

  const lgas = structure.data ?? [];
  const lga = lgas.find((l) => l.id === lgaId) ?? null;
  const ward = lga?.wards.find((w) => w.id === wardId) ?? null;

  const pus = useQuery({
    queryKey: ["irev", "pus", electionId, wardId],
    queryFn: () => getWardPus({ data: { electionId, wardId: wardId! } }),
    enabled: Boolean(electionId && wardId),
    refetchInterval: 20_000,
    refetchIntervalInBackground: true,
    staleTime: 30_000,
  });

  const filteredLgas = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return lgas;
    return lgas.filter((l) => l.name.toLowerCase().includes(s));
  }, [lgas, q]);

  const active = elections.find((e) => e.id === electionId);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Live from INEC IReV
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Polling units by region</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Pick a contest, then a local government area and ward. Every polling unit in that
        ward is listed with its code and, where INEC has published it, a direct link to
        the scanned Form EC8A result sheet.
      </p>

      <div className="panel mt-8 grid gap-4 p-4 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm md:col-span-2">
          <span className="text-muted-foreground">Contest</span>
          <select
            value={electionId}
            onChange={(e) => {
              setElectionId(e.target.value);
              setLgaId(null);
              setWardId(null);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted-foreground">Find a region</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Ife North"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
      </div>

      {active ? (
        <p className="mono-code mt-3 text-xs text-muted-foreground">
          {active.type} · {active.area} · {new Date(active.date).toDateString()}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)]">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Regions ({filteredLgas.length})
          </h2>
          {structure.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading regions…</p>
          ) : null}
          <ul className="mt-3 grid max-h-[26rem] gap-1 overflow-y-auto pr-1">
            {filteredLgas.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => {
                    setLgaId(l.id);
                    setWardId(null);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    l.id === lgaId
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  {l.name}
                  <span className="mono-code ml-2 text-xs opacity-70">
                    {l.wards.length} wards
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Wards {lga ? `· ${lga.name}` : ""}
          </h2>
          {!lga ? (
            <p className="mt-3 text-sm text-muted-foreground">Choose a region first.</p>
          ) : (
            <ul className="mt-3 grid max-h-[26rem] gap-1 overflow-y-auto pr-1">
              {lga.wards.map((w) => (
                <li key={w.id}>
                  <button
                    onClick={() => setWardId(w.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      w.id === wardId
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    {w.name}
                    <span className="mono-code ml-2 text-xs opacity-70">{w.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Polling units {ward ? `· ${ward.name}` : ""}
          </h2>
          {!ward ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Choose a ward to list every polling unit in it.
            </p>
          ) : pus.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading polling units…</p>
          ) : (pus.data?.length ?? 0) === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No polling units published for this ward yet.
            </p>
          ) : (
            <div className="mt-3 max-h-[26rem] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2">Unit</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Sheet</th>
                  </tr>
                </thead>
                <tbody>
                  {pus.data!.map((p) => (
                    <tr key={p.id} className="border-t border-border/60 align-top">
                      <td className="py-2 pr-3">
                        {p.name}
                        {p.replaced ? (
                          <span className="mono-code ml-2 rounded-full border border-border px-1.5 py-0.5 text-[0.6rem] uppercase">
                            replaced
                          </span>
                        ) : null}
                      </td>
                      <td className="mono-code py-2 pr-3 text-xs text-muted-foreground">
                        {p.puCode}
                      </td>
                      <td className="py-2">
                        {p.sheetUrl ? (
                          <a
                            href={p.sheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Form EC8A ↗
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            not uploaded
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Source: INEC IReV public result portal, refreshed every 60 seconds. IReV publishes
        the scanned sheets and polling-unit structure; it does not publish machine-readable
        per-party vote numbers, so vote figures here always come from the sheets themselves.
      </p>
    </main>
  );
}
