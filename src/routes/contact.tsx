import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Plan a deployment — contact TogetherNigeria" },
      {
        name: "description",
        content:
          "Tell TogetherNigeria the contests, geography, users and decisions your election room needs to support, and we will scope the right election-day view.",
      },
      { property: "og:title", content: "Plan a deployment — TogetherNigeria" },
      {
        property: "og:description",
        content:
          "Scope an election-day monitoring deployment for your newsroom, observation mission or legal team.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    org: "",
    role: "Newsroom",
    scope: "",
  });

  const chatUrl = whatsappLink(
    `Deployment request — ${form.org || form.name || "TogetherNigeria"}\n\nName: ${form.name}\nOrganisation: ${form.org}\nEmail: ${form.email}\nTeam type: ${form.role}\n\nWhat we need:\n${form.scope}`,
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Plan a deployment
      </p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">
        Build the right election-day view before polling begins.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Tell us the contests, geography, users and decisions your room needs to support.
        We will come back with a scoped deployment plan.
      </p>

      <form
        className="panel mt-8 grid gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
          window.open(chatUrl, "_blank", "noopener,noreferrer");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Your name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Field
            label="Organisation"
            value={form.org}
            onChange={(v) => setForm({ ...form, org: v })}
          />
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted-foreground">Team type</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
            >
              {["Newsroom", "Observation mission", "Legal / petition team", "Political party", "Research", "Other"].map(
                (r) => (
                  <option key={r}>{r}</option>
                ),
              )}
            </select>
          </label>
        </div>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted-foreground">
            Contests, geography and what your room must decide
          </span>
          <textarea
            rows={5}
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
            placeholder="e.g. Governorship in Osun and Ekiti, ward-level coverage tracking, two desks and a legal reviewer."
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start a conversation
          </button>
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            WhatsApp {WHATSAPP_NUMBER}
          </a>
        </div>
        {sent ? (
          <p className="rounded-lg bg-live/10 px-3 py-2 text-sm text-live">
            WhatsApp should open with your request ready to send.
          </p>
        ) : null}
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        Enquiries go straight to WhatsApp on {WHATSAPP_NUMBER}.
      </p>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
      />
    </label>
  );
}
