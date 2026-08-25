/**
 * RUM — Result Upload Monitor.
 *
 * Reads the public Mundx Osun open-tally export (an independent aggregation of
 * INEC IReV Form EC8A uploads) and reduces the ~5MB polling-unit payload into a
 * compact dashboard model. Nothing here is invented: every figure is summed
 * from the published per-polling-unit rows.
 */
const SOURCE_URL = "https://osun.mundx.com/api/export/opentally.json";

type RawPu = {
  puId: string;
  lga: string;
  ward: string;
  code: string;
  puName: string;
  registered: number;
  accredited: number;
  rejected: number;
  valid: number;
  votes: number[];
  otherVotes: number;
  turnout: number;
  flags: string[];
  autoPass: boolean;
  uploaded: boolean;
  status: string;
  replaced: boolean;
  currentLeader: string | null;
  documentUrl?: string | null;
};

type RawExport = {
  built_at: string;
  meta: Record<string, unknown> & {
    title: string;
    subtitle: string;
    scope_name: string;
    updated_at: string;
    total_pus: number;
    expected_lgas: number;
    expected_wards: number;
    uploaded: number;
    replacements_detected: number;
    margin_note: string;
    election_date: string;
    hashtag: string;
  };
  parties: string[];
  party_colors: Record<string, string>;
  party_names: Record<string, string>;
  candidates: Record<string, string>;
  lga_cfg: Array<{ name: string; total_pus: number }>;
  pus: RawPu[];
  replacements: Array<{
    code: string;
    ward: string;
    leader_changed: boolean;
    old_leader: string | null;
    new_leader: string | null;
    ts: string;
  }>;
};

export type PartyTally = {
  code: string;
  name: string;
  candidate: string;
  color: string;
  votes: number;
  share: number;
};

export type WardRow = {
  name: string;
  pus: number;
  votes: Record<string, number>;
  other: number;
  total: number;
  leader: string | null;
};

export type LgaRow = {
  name: string;
  pusIn: number;
  pusTotal: number;
  votes: Record<string, number>;
  other: number;
  total: number;
  registered: number;
  accredited: number;
  leader: string | null;
  margin: number;
  band: "safe" | "watch";
  wards: WardRow[];
};

export type RumSnapshot = {
  title: string;
  subtitle: string;
  scope: string;
  updatedAt: string;
  builtAt: string;
  note: string;
  hashtag: string;
  electionDate: string;
  parties: PartyTally[];
  others: number;
  othersShare: number;
  validVotes: number;
  lead: { margin: number; points: number; leader: string | null; runnerUp: string | null };
  coverage: {
    uploaded: number;
    totalPus: number;
    percent: number;
    lgas: number;
    wards: number;
  };
  integrity: {
    clean: number;
    flagged: number;
    queued: number;
    processing: number;
    retrying: number;
    excluded: number;
    countedPercent: number;
  };
  flagBreakdown: Array<{ flag: string; count: number }>;
  lgas: LgaRow[];
  replacements: Array<{
    code: string;
    ward: string;
    leaderChanged: boolean;
    oldLeader: string | null;
    newLeader: string | null;
    ts: string;
  }>;
};

let cache: { at: number; data: RumSnapshot } | null = null;
const TTL = 60_000;

function leaderOf(votes: Record<string, number>) {
  let best: string | null = null;
  for (const [k, v] of Object.entries(votes)) {
    if (best === null || v > votes[best]!) best = k;
  }
  return best && votes[best]! > 0 ? best : null;
}

export async function fetchRumSnapshot(): Promise<RumSnapshot> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;

  const res = await fetch(SOURCE_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`RUM source request failed (${res.status})`);
  const raw = (await res.json()) as RawExport;

  const codes = raw.parties;
  const zero = () => Object.fromEntries(codes.map((c) => [c, 0])) as Record<string, number>;

  const state = zero();
  let stateOther = 0;
  let validVotes = 0;

  const integrity = {
    clean: 0,
    flagged: 0,
    queued: 0,
    processing: 0,
    retrying: 0,
    excluded: 0,
    countedPercent: 0,
  };
  const flagCounts = new Map<string, number>();

  const lgaMap = new Map<
    string,
    {
      pusIn: number;
      votes: Record<string, number>;
      other: number;
      registered: number;
      accredited: number;
      wards: Map<string, { pus: number; votes: Record<string, number>; other: number }>;
    }
  >();

  let uploaded = 0;
  const wardSet = new Set<string>();

  for (const pu of raw.pus) {
    if (pu.uploaded) uploaded += 1;
    wardSet.add(`${pu.lga}|${pu.ward}`);
    for (const f of pu.flags ?? []) flagCounts.set(f, (flagCounts.get(f) ?? 0) + 1);

    switch (pu.status) {
      case "counted":
        if ((pu.flags?.length ?? 0) > 0) integrity.flagged += 1;
        else integrity.clean += 1;
        break;
      case "queued":
        integrity.queued += 1;
        break;
      case "processing":
        integrity.processing += 1;
        break;
      case "retrying":
        integrity.retrying += 1;
        break;
      case "invalid":
        integrity.excluded += 1;
        break;
      default:
        break;
    }

    if (pu.status !== "counted") continue;

    validVotes += pu.valid ?? 0;
    stateOther += pu.otherVotes ?? 0;
    codes.forEach((c, i) => {
      state[c] = (state[c] ?? 0) + (pu.votes?.[i] ?? 0);
    });

    let lga = lgaMap.get(pu.lga);
    if (!lga) {
      lga = {
        pusIn: 0,
        votes: zero(),
        other: 0,
        registered: 0,
        accredited: 0,
        wards: new Map(),
      };
      lgaMap.set(pu.lga, lga);
    }
    lga.pusIn += 1;
    lga.other += pu.otherVotes ?? 0;
    lga.registered += pu.registered ?? 0;
    lga.accredited += pu.accredited ?? 0;
    codes.forEach((c, i) => {
      lga!.votes[c] = (lga!.votes[c] ?? 0) + (pu.votes?.[i] ?? 0);
    });

    let ward = lga.wards.get(pu.ward);
    if (!ward) {
      ward = { pus: 0, votes: zero(), other: 0 };
      lga.wards.set(pu.ward, ward);
    }
    ward.pus += 1;
    ward.other += pu.otherVotes ?? 0;
    codes.forEach((c, i) => {
      ward!.votes[c] = (ward!.votes[c] ?? 0) + (pu.votes?.[i] ?? 0);
    });
  }

  const counted = integrity.clean + integrity.flagged;
  integrity.countedPercent = uploaded ? (counted / uploaded) * 100 : 0;

  const grandTotal = codes.reduce((s, c) => s + (state[c] ?? 0), 0) + stateOther;
  const parties: PartyTally[] = codes
    .map((c) => ({
      code: c,
      name: raw.party_names[c] ?? c,
      candidate: raw.candidates[c] ?? "",
      color: raw.party_colors[c] ?? "#888888",
      votes: state[c] ?? 0,
      share: grandTotal ? ((state[c] ?? 0) / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  const totalsByPu = new Map(raw.lga_cfg.map((l) => [l.name, l.total_pus]));

  const lgas: LgaRow[] = [...lgaMap.entries()]
    .map(([name, l]) => {
      const total = codes.reduce((s, c) => s + (l.votes[c] ?? 0), 0) + l.other;
      const ranked = codes
        .map((c) => ({ c, v: l.votes[c] ?? 0 }))
        .sort((a, b) => b.v - a.v);
      const margin = total
        ? (((ranked[0]?.v ?? 0) - (ranked[1]?.v ?? 0)) / total) * 100
        : 0;
      return {
        name,
        pusIn: l.pusIn,
        pusTotal: totalsByPu.get(name) ?? l.pusIn,
        votes: l.votes,
        other: l.other,
        total,
        registered: l.registered,
        accredited: l.accredited,
        leader: leaderOf(l.votes),
        margin,
        band: (margin >= 12 ? "safe" : "watch") as "safe" | "watch",
        wards: [...l.wards.entries()]
          .map(([wName, w]) => ({
            name: wName,
            pus: w.pus,
            votes: w.votes,
            other: w.other,
            total: codes.reduce((s, c) => s + (w.votes[c] ?? 0), 0) + w.other,
            leader: leaderOf(w.votes),
          }))
          .sort((a, b) => b.total - a.total),
      };
    })
    .sort((a, b) => b.pusIn - a.pusIn);

  const snapshot: RumSnapshot = {
    title: raw.meta.title,
    subtitle: raw.meta.subtitle,
    scope: raw.meta.scope_name,
    updatedAt: raw.meta.updated_at,
    builtAt: raw.built_at,
    note: raw.meta.margin_note,
    hashtag: raw.meta.hashtag,
    electionDate: raw.meta.election_date,
    parties,
    others: stateOther,
    othersShare: grandTotal ? (stateOther / grandTotal) * 100 : 0,
    validVotes,
    lead: {
      margin: (parties[0]?.votes ?? 0) - (parties[1]?.votes ?? 0),
      points: (parties[0]?.share ?? 0) - (parties[1]?.share ?? 0),
      leader: parties[0]?.code ?? null,
      runnerUp: parties[1]?.code ?? null,
    },
    coverage: {
      uploaded,
      totalPus: raw.meta.total_pus,
      percent: raw.meta.total_pus ? (uploaded / raw.meta.total_pus) * 100 : 0,
      lgas: raw.meta.expected_lgas,
      wards: raw.meta.expected_wards,
    },
    integrity,
    flagBreakdown: [...flagCounts.entries()]
      .map(([flag, count]) => ({ flag, count }))
      .sort((a, b) => b.count - a.count),
    lgas,
    replacements: (raw.replacements ?? []).slice(0, 20).map((r) => ({
      code: r.code,
      ward: r.ward,
      leaderChanged: r.leader_changed,
      oldLeader: r.old_leader,
      newLeader: r.new_leader,
      ts: r.ts,
    })),
  };

  cache = { at: Date.now(), data: snapshot };
  return snapshot;
}

export type PuSearchRow = {
  id: string;
  code: string;
  name: string;
  lga: string;
  ward: string;
  registered: number;
  accredited: number;
  valid: number;
  votes: Record<string, number>;
  other: number;
  status: string;
  flags: string[];
  leader: string | null;
  sheetUrl: string | null;
};

export async function searchPus(query: string, limit = 25): Promise<PuSearchRow[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const res = await fetch(SOURCE_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`RUM source request failed (${res.status})`);
  const raw = (await res.json()) as RawExport;
  const codes = raw.parties;

  const out: PuSearchRow[] = [];
  for (const pu of raw.pus) {
    if (
      pu.code.toLowerCase().includes(q) ||
      pu.puName.toLowerCase().includes(q) ||
      pu.ward.toLowerCase().includes(q)
    ) {
      out.push({
        id: pu.puId,
        code: pu.code,
        name: pu.puName,
        lga: pu.lga,
        ward: pu.ward,
        registered: pu.registered,
        accredited: pu.accredited,
        valid: pu.valid,
        votes: Object.fromEntries(codes.map((c, i) => [c, pu.votes?.[i] ?? 0])),
        other: pu.otherVotes ?? 0,
        status: pu.status,
        flags: pu.flags ?? [],
        leader: pu.currentLeader ?? null,
        sheetUrl: pu.documentUrl ?? null,
      });
      if (out.length >= limit) break;
    }
  }
  return out;
}
