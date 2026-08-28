import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { buildContests, type ContestType } from "@/lib/contests";

export const Route = createFileRoute("/elections")({
  head: () => ({
    meta: [
      { title: "Election Hub — 2027 Nigerian contests | TogetherNigeria" },
      {
        name: "description",
        content:
          "Browse every 2027 Nigerian contest: presidential, governorship, Senate and House of Representatives, with permanent records per state and zone.",
      },
      { property: "og:title", content: "Election Hub — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Every 2027 presidential, governorship, Senate and House contest in one directory.",
      },
      { property: "og:url", content: "/elections" },
    ],
    links: [{ rel: "canonical", href: "/elections" }],
  }),
  component: ElectionHub,
});

const TYPES: (ContestType | "All")[] = [
  "All",
  "Presidential",
  "Governorship",
  "Senate",
  "House",
];

function ElectionHub() {
  const all = useMemo(() => buildContests(), []);
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

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        2027 general election
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Election Hub</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Permanent records for every federal contest in the 2027 cycle. Each record moves
        from pre-election context, to live upload monitoring, to a final source-linked
        archive built on INEC IReV publications.
      </p>

      <div className="panel mt-8 flex flex-wrap items-end gap-4 p-4">
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
        {rows.map((c) => (
          <li key={c.id} className="panel p-4">
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
            <div className="mt-4 flex gap-2">
              <Link
                to="/monitor"
                className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
              >
                Live uploads
              </Link>
              <Link
                to="/method"
                className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
              >
                Record method
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No contests match that filter.</p>
      ) : null}
    </main>
  );
}
