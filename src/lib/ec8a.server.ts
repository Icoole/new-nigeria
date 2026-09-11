/**
 * Reads scanned INEC Form EC8A sheets published on IReV and turns them into
 * machine-readable per-party vote numbers.
 *
 * Every number stored here comes from a specific scanned sheet, and every row
 * keeps the URL of that sheet so any figure can be checked against the source.
 */
import { fetchRecentUploads } from "./irev.server";
import { PARTIES } from "./parties";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";
const MAX_SHEETS_PER_SWEEP = 4;

export type Reading = {
  pu_id: string;
  pu_code: string | null;
  pu_name: string | null;
  lga: string | null;
  ward: string | null;
  sheet_url: string;
  accredited: number | null;
  valid_votes: number | null;
  rejected_votes: number | null;
  total_votes: number | null;
  votes: Record<string, number>;
  confidence: number | null;
  status: string;
  note: string | null;
};

const PARTY_CODES = PARTIES.map((p) => p.code);

function num(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v.replace(/[^\d]/g, "")) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

async function sheetToDataUrl(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "image/jpeg";
  if (!type.startsWith("image/")) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > 8_000_000) return null;
  let bin = "";
  for (let i = 0; i < buf.length; i += 8192) {
    bin += String.fromCharCode(...buf.subarray(i, i + 8192));
  }
  return `data:${type};base64,${btoa(bin)}`;
}

const PROMPT = `You are reading a scanned Nigerian INEC Form EC8A polling-unit result sheet.
Return ONLY JSON, no prose, in this exact shape:
{"accredited":number|null,"valid":number|null,"rejected":number|null,"total":number|null,"votes":{"PARTYCODE":number},"confidence":0-1,"note":string}
Rules:
- "votes" uses INEC party codes only, from this list: ${PARTY_CODES.join(", ")}.
- Include a party only if you can actually read its number on the sheet. Omit blanks.
- Never guess. If the scan is unreadable or is not an EC8A sheet, return confidence 0, empty votes and explain in "note".
- confidence reflects how clearly the handwriting and totals could be read.`;

async function readSheet(dataUrl: string, apiKey: string) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI read failed (${res.status})`);
  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json) as {
    accredited?: unknown;
    valid?: unknown;
    rejected?: unknown;
    total?: unknown;
    votes?: Record<string, unknown>;
    confidence?: unknown;
    note?: unknown;
  };
}

/**
 * Reads a handful of the newest sheets for an election that have not been read
 * yet, and stores what it finds. Safe to call repeatedly — already-read sheets
 * are skipped, so the tallies simply grow as INEC uploads more sheets.
 */
export async function sweepElection(electionId: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { read: 0, skipped: 0, reason: "ai-unavailable" as const };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const uploads = (await fetchRecentUploads(electionId, 60)).filter((u) => u.sheetUrl);
  if (uploads.length === 0) return { read: 0, skipped: 0, reason: "no-sheets" as const };

  const { data: existing } = await supabaseAdmin
    .from("ec8a_readings")
    .select("sheet_url")
    .eq("election_id", electionId)
    .in(
      "sheet_url",
      uploads.map((u) => u.sheetUrl as string),
    );
  const seen = new Set((existing ?? []).map((r) => r.sheet_url));
  const pending = uploads.filter((u) => !seen.has(u.sheetUrl as string));
  const batch = pending.slice(0, MAX_SHEETS_PER_SWEEP);

  let read = 0;
  for (const u of batch) {
    const url = u.sheetUrl as string;
    let row: Reading = {
      pu_id: u.id,
      pu_code: u.puCode,
      pu_name: u.puName,
      lga: u.lga,
      ward: u.ward,
      sheet_url: url,
      accredited: null,
      valid_votes: null,
      rejected_votes: null,
      total_votes: null,
      votes: {},
      confidence: 0,
      status: "unreadable",
      note: null,
    };
    try {
      const dataUrl = await sheetToDataUrl(url);
      if (!dataUrl) {
        row.note = "Sheet could not be downloaded as an image.";
      } else {
        const parsed = await readSheet(dataUrl, apiKey);
        const votes: Record<string, number> = {};
        for (const [code, value] of Object.entries(parsed.votes ?? {})) {
          const c = code.toUpperCase().trim();
          const n = num(value);
          if (PARTY_CODES.includes(c) && n !== null) votes[c] = n;
        }
        const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;
        row = {
          ...row,
          accredited: num(parsed.accredited),
          valid_votes: num(parsed.valid),
          rejected_votes: num(parsed.rejected),
          total_votes: num(parsed.total),
          votes,
          confidence,
          status: Object.keys(votes).length > 0 && confidence >= 0.4 ? "read" : "unreadable",
          note: typeof parsed.note === "string" ? parsed.note.slice(0, 400) : null,
        };
      }
    } catch (err) {
      row.note = err instanceof Error ? err.message.slice(0, 200) : "Read failed";
    }

    const { error } = await supabaseAdmin.from("ec8a_readings").upsert(
      { election_id: electionId, sheet_updated_at: u.uploadedAt, ...row },
      { onConflict: "election_id,pu_id,sheet_url" },
    );
    if (!error && row.status === "read") read += 1;
  }

  return { read, skipped: pending.length - batch.length, reason: "ok" as const };
}

export type Tally = {
  code: string;
  name: string;
  color: string;
  votes: number;
};

export type TallySnapshot = {
  parties: Tally[];
  totalVotes: number;
  sheetsRead: number;
  sheetsUnreadable: number;
  accredited: number;
  rejected: number;
  lastReadAt: string | null;
  recent: Array<{
    puName: string | null;
    puCode: string | null;
    lga: string | null;
    sheetUrl: string;
    leader: string | null;
    total: number;
    confidence: number | null;
  }>;
};

export async function fetchTallies(electionId: string): Promise<TallySnapshot> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("ec8a_readings")
    .select(
      "pu_name, pu_code, lga, sheet_url, votes, accredited, rejected_votes, total_votes, confidence, status, created_at",
    )
    .eq("election_id", electionId)
    .order("created_at", { ascending: false })
    .limit(2000);

  const rows = data ?? [];
  const totals: Record<string, number> = {};
  let totalVotes = 0;
  let accredited = 0;
  let rejected = 0;
  let sheetsRead = 0;
  let sheetsUnreadable = 0;

  for (const r of rows) {
    if (r.status !== "read") {
      sheetsUnreadable += 1;
      continue;
    }
    sheetsRead += 1;
    accredited += r.accredited ?? 0;
    rejected += r.rejected_votes ?? 0;
    for (const [code, v] of Object.entries((r.votes ?? {}) as Record<string, number>)) {
      const n = typeof v === "number" ? v : 0;
      totals[code] = (totals[code] ?? 0) + n;
      totalVotes += n;
    }
  }

  const parties = PARTIES.filter((p) => (totals[p.code] ?? 0) > 0)
    .map((p) => ({ code: p.code, name: p.name, color: p.color, votes: totals[p.code] ?? 0 }))
    .sort((a, b) => b.votes - a.votes);

  const recent = rows
    .filter((r) => r.status === "read")
    .slice(0, 12)
    .map((r) => {
      const v = (r.votes ?? {}) as Record<string, number>;
      const entries = Object.entries(v).sort((a, b) => b[1] - a[1]);
      return {
        puName: r.pu_name,
        puCode: r.pu_code,
        lga: r.lga,
        sheetUrl: r.sheet_url,
        leader: entries[0]?.[0] ?? null,
        total: entries.reduce((s, [, n]) => s + n, 0),
        confidence: r.confidence,
      };
    });

  return {
    parties,
    totalVotes,
    sheetsRead,
    sheetsUnreadable,
    accredited,
    rejected,
    lastReadAt: rows[0]?.created_at ?? null,
    recent,
  };
}
