import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { WHATSAPP_DEFAULT } from "@/lib/whatsapp";

const NAV = [
  { to: "/monitor", label: "The Monitor" },
  { to: "/elections", label: "Election Hub" },
  { to: "/parties", label: "Parties" },
  { to: "/polling-units", label: "Polling Units" },
  { to: "/results-2023", label: "2023 Map" },
  { to: "/aso-rock", label: "Path to Aso Rock" },
  { to: "/insights", label: "Insights" },
  { to: "/method", label: "Method" },
  { to: "/rum", label: "Osun 2026" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="live-dot" aria-hidden="true" />
          <span className="font-display text-base font-bold tracking-tight">
            Together<span className="text-primary">Nigeria</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-accent text-foreground" }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_DEFAULT}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Chat on WhatsApp
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="rounded-md border border-border px-3 py-1.5 text-sm lg:hidden"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-border bg-surface px-5 py-3 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {[...NAV, { to: "/contact", label: "Contact" } as const].map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface/50">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-bold">
            Together<span className="text-primary">Nigeria</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Nigerian election data and technology: published results turned into live
            monitoring, source-linked evidence records and operational tools for the teams
            that report, observe and scrutinise elections.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Data source: INEC IReV public result portal. TogetherNigeria provides data and
            tools, not legal advice or official declarations.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Products
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            {NAV.slice(0, 5).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-muted-foreground hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Company
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <Link to="/method" className="text-muted-foreground hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <a
                href={WHATSAPP_DEFAULT}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                WhatsApp +234 902 091 5799 ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.inecnigeria.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                INEC ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground md:px-8">
        © {new Date().getFullYear()} TogetherNigeria. Independent, non-partisan election
        data.
      </div>
    </footer>
  );
}
