import { createFileRoute, Link } from "@tanstack/react-router";

import { nationalTotals, STATE_RESULTS_2023, PARTY_META, PARTY_CODES } from "@/lib/results2023";
import { buildContests } from "@/lib/contests";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TogetherNigeria — Election results, evidence and operations" },
      {
        name: "description",
        content:
          "TogetherNigeria turns published INEC results into live monitoring, interactive maps, source-linked election records and operational tools for reporting, observation and scrutiny.",
      },
      { property: "og:title", content: "TogetherNigeria — Nigerian election data platform" },
      {
        property: "og:description",
        content:
          "Live IReV monitoring, the 2023 presidential map, the 2027 election hub and source-linked evidence records.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TogetherNigeria",
          description:
            "Nigerian election data and technology platform for monitoring, evidence and operations.",
          url: "/",
        }),
      },
    ],
  }),
  component: Home,
});

const nf = (n: number) => n.toLocaleString("en-NG");

function Home() {
  const totals = nationalTotals(STATE_RESULTS_2023);
  const grand = PARTY_CODES.reduce((s, c) => s + totals[c], 0);
  const contests = buildContests();
  const seats = contests.reduce((s, c) => s + c.seats, 0);

  return (
    <main id="main">
      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-4 pt-12 md:px-8 md:pt-20">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="live-dot" aria-hidden="true" />
          Nigerian election data
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] md:text-6xl">
          Nigerian election results, evidence and operations in one system.
        </h1>
        <p className="mt-5 max-w-3xl text-base text-muted-foreground md:text-lg">
          TogetherNigeria turns published results into live monitoring, interactive maps,
          durable election records and operational tools for the teams that report,
          observe, analyse and scrutinise elections.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/elections"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the Election Hub
          </Link>
          <Link
            to="/results-2023"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Explore the 2023 map
          </Link>
          <Link
            to="/monitor"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Watch live IReV uploads
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Fact k="2023" v="Current public results dataset" />
          <Fact k="Presidential" v="Contest represented in the public map" />
          <Fact k="Live" v="Polling-unit coverage from INEC IReV" />
          <Fact k="37" v="States + FCT represented" />
        </div>
      </section>

      {/* Aso Rock callout */}
      <section className="mx-auto mt-12 w-full max-w-7xl px-5 md:px-8">
        <Link
          to="/aso-rock"
          className="panel block p-6 transition-colors hover:bg-surface-2 md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-pending">
            New · free interactive
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">Path to Aso Rock</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Start with the declared 2023 presidential result. Change state vote shares and
            turnout, track the national vote and the 25% spread rule, then share your path
            to victory.
          </p>
          <p className="mt-4 text-sm font-semibold text-primary">Build a 2027 path →</p>
        </Link>
      </section>

      {/* Flagship */}
      <section className="mx-auto mt-14 w-full max-w-7xl px-5 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Flagship product
        </p>
        <div className="mt-3 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">The Monitor</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A live workspace for reading published results, checking internal arithmetic,
              tracking upload coverage and opening every result against its source record.
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
              {[
                "National, state, LGA, ward and polling-unit views",
                "Arithmetic, identity, duplication and legibility checks",
                "Coverage and missing-result tracking",
                "Public summaries and access-controlled team workspaces",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-primary">▸</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/method"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                How it works
              </Link>
              <Link
                to="/elections"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Browse elections
              </Link>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="text-lg font-semibold">Election records that stay put</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Permanent contest routes move from pre-election context to live reporting and
              a final source-linked archive.
            </p>
            <div className="mono-code mt-5 flex flex-wrap gap-2 text-xs">
              {["planned", "live", "final", "archive"].map((s, i) => (
                <span
                  key={s}
                  className={`rounded-full border px-3 py-1 ${
                    i === 1
                      ? "border-live/50 text-live"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  2027 contests
                </dt>
                <dd className="stat-value mt-1 text-2xl">{nf(seats)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  2023 votes mapped
                </dt>
                <dd className="stat-value mt-1 text-2xl">{nf(grand)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* One platform */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-5 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          One platform
        </p>
        <h2 className="mt-2 text-3xl font-bold">
          Public results and controlled team tools
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Explore published results openly, or use a controlled workspace for reporting,
          evidence review and election-day operations.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card
            tag="Public"
            title="2023 presidential map"
            body="Interactive four-party results across all 36 states and the FCT."
            to="/results-2023"
            cta="Open the map →"
          />
          <Card
            tag="Elections"
            title="Election Hub"
            body="Browse every 2027 presidential, governorship, Senate and House contest."
            to="/elections"
            cta="Open the hub →"
          />
          <Card
            tag="Insights"
            title="2023 election briefings"
            body="Where each candidate's vote was concentrated, how turnout moved and how governorship votes compared with the presidential."
            to="/insights"
            cta="Read Insights →"
          />
        </div>
      </section>

      {/* Legal */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-5 md:px-8">
        <div className="panel grid gap-8 p-6 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Legal &amp; petition teams
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Move from a result to its source record without losing the trail.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The legal workspace is designed for evidence review and preservation.
              TogetherNigeria provides data and tools, not legal advice.
            </p>
            <p className="mono-code mt-5 text-xs text-muted-foreground">
              access-controlled · scoped exports · source-linked records
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {[
              "Search by state, LGA, ward and polling unit",
              "Open each number against its published source image",
              "Preserve publication time, source metadata and replacement history",
              "See arithmetic, identity, duplication and legibility flags",
              "Export a scoped, timestamped evidence pack",
              "Keep annotations and review notes in a controlled workspace",
            ].map((t) => (
              <li key={t} className="flex gap-2 rounded-lg bg-surface-2 px-3 py-2">
                <span className="text-primary">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deployments */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-5 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Deployments
        </p>
        <h2 className="mt-2 text-3xl font-bold">2026 election records and 2027 planning</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card
            tag="Osun 2026"
            title="Osun governorship election record"
            body="Statewide tally, LGA and ward breakdown, coverage and form integrity from the 2026 Osun governorship election."
            to="/rum"
            cta="Open the record →"
          />
          <Card
            tag="Live"
            title="IReV upload monitor"
            body="Polling-unit Form EC8A uploads as they land on the INEC IReV portal, with coverage and replacement tracking."
            to="/monitor"
            cta="Watch live →"
          />
          <Card
            tag="2027"
            title="General election directory"
            body={`All ${nf(seats)} presidential, governorship, Senate and House of Representatives contests.`}
            to="/elections"
            cta="Browse contests →"
          />
        </div>
      </section>

      {/* 2023 snapshot bar */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-5 md:px-8">
        <div className="panel p-6">
          <h2 className="text-lg font-semibold">2023 presidential — declared national vote</h2>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
            {PARTY_CODES.map((c) => (
              <div
                key={c}
                style={{
                  width: `${(totals[c] / grand) * 100}%`,
                  backgroundColor: PARTY_META[c].color,
                }}
                title={`${c} ${nf(totals[c])}`}
              />
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PARTY_CODES.map((c) => (
              <div key={c} className="rounded-lg bg-surface-2 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: PARTY_META[c].color }}
                  />
                  <span className="mono-code text-sm font-semibold">{c}</span>
                </div>
                <p className="stat-value mt-1 text-xl">{nf(totals[c])}</p>
                <p className="text-xs text-muted-foreground">
                  {((totals[c] / grand) * 100).toFixed(1)}% · {PARTY_META[c].candidate}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-5 md:px-8">
        <div className="panel flex flex-wrap items-center justify-between gap-6 p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Plan a deployment
            </p>
            <h2 className="mt-2 max-w-2xl text-2xl font-bold">
              Build the right election-day view before polling begins.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Tell us the contests, geography, users and decisions your room needs to
              support.
            </p>
          </div>
          <a
            href={WHATSAPP_DEFAULT}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start a conversation on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="panel p-4">
      <p className="stat-value text-2xl text-primary">{k}</p>
      <p className="mt-1 text-xs text-muted-foreground">{v}</p>
    </div>
  );
}

function Card({
  tag,
  title,
  body,
  to,
  cta,
}: {
  tag: string;
  title: string;
  body: string;
  to: string;
  cta: string;
}) {
  return (
    <Link to={to} className="panel block p-5 transition-colors hover:bg-surface-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {tag}
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <p className="mt-4 text-sm font-semibold text-primary">{cta}</p>
    </Link>
  );
}
