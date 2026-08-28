import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: "Method — how the Monitor reads results | TogetherNigeria" },
      {
        name: "description",
        content:
          "How TogetherNigeria ingests INEC IReV publications, runs arithmetic, identity, duplication and legibility checks, tracks coverage and preserves replacement history.",
      },
      { property: "og:title", content: "Method — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Ingestion, checks, coverage tracking and source preservation behind the Monitor.",
      },
      { property: "og:url", content: "/method" },
    ],
    links: [{ rel: "canonical", href: "/method" }],
  }),
  component: Method,
});

const STEPS = [
  {
    n: "01",
    t: "Ingest published records",
    d: "The Monitor polls the INEC IReV public API for election metadata, polling-unit coverage and every published Form EC8A image. Nothing is scraped from unofficial sources.",
  },
  {
    n: "02",
    t: "Read the sheet",
    d: "Each scan is read for registered voters, accredited voters, party votes, rejected and total valid votes. Values that cannot be read confidently are queued rather than guessed.",
  },
  {
    n: "03",
    t: "Run the checks",
    d: "Arithmetic (party votes vs valid votes, valid + rejected vs total), identity (unit code matches the sheet), duplication (same sheet published for two units) and legibility.",
  },
  {
    n: "04",
    t: "Track coverage",
    d: "Uploaded versus expected polling units per ward, LGA and state, so missing results are visible instead of silently absent.",
  },
  {
    n: "05",
    t: "Preserve the trail",
    d: "Publication time, source URL and any replacement of a previously published sheet are kept, so a result can always be opened against the record it came from.",
  },
  {
    n: "06",
    t: "Publish and export",
    d: "Public summaries stay open. Teams work in an access-controlled workspace with scoped, timestamped evidence exports.",
  },
];

const FLAGS = [
  ["Arithmetic", "Party votes do not sum to the valid-vote figure on the sheet."],
  ["Over-voting", "Total votes cast exceed accredited voters for the unit."],
  ["Identity", "Unit code or name on the sheet differs from the published unit."],
  ["Duplication", "The same scan appears under more than one polling unit."],
  ["Legibility", "The scan is too poor to read one or more figures."],
  ["Replacement", "A previously published sheet was swapped after publication."],
];

function Method() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Method
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">How the Monitor works</h1>
      <p className="mt-3 text-muted-foreground">
        TogetherNigeria never invents a number. Every figure shown is either published by
        INEC or derived by arithmetic from a published Form EC8A, and every derived figure
        links back to the scan it came from.
      </p>

      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="panel p-5">
            <p className="mono-code text-sm text-primary">{s.n}</p>
            <h2 className="mt-2 text-lg font-semibold">{s.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>

      <section className="panel mt-8 p-5">
        <h2 className="text-lg font-semibold">Flags we raise</h2>
        <ul className="mt-4 grid gap-2">
          {FLAGS.map(([k, v]) => (
            <li key={k} className="grid gap-1 rounded-lg bg-surface-2 px-3 py-2 sm:grid-cols-[9rem_1fr]">
              <span className="mono-code text-sm text-pending">{k}</span>
              <span className="text-sm text-muted-foreground">{v}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-semibold">Limits we state plainly</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <li>
            IReV publishes scanned sheets and coverage metadata — not machine-readable
            per-party tallies. Any tally is an independent aggregation, never an official
            declaration.
          </li>
          <li>
            Coverage is partial until INEC finishes uploading; a lead in early uploads is
            not a result.
          </li>
          <li>
            TogetherNigeria provides data and tools, not legal advice and not certification
            of any outcome.
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/monitor"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            See it live
          </Link>
          <Link
            to="/rum"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Osun 2026 record
          </Link>
        </div>
      </section>
    </main>
  );
}
