/**
 * Thin client for the public INEC IReV result API.
 *
 * IReV publishes election metadata, polling-unit coverage and the scanned
 * Form EC8A images. It does NOT publish machine-readable per-party vote
 * numbers, so anything party-level here is derived from the sheets, never
 * invented.
 */
const IREV_BASE = "https://dolphin-app-sleqh.ondigitalocean.app/api/v1";

type IrevEnvelope<T> = { success: boolean; request_time: number; data: T };

async function irevGet<T>(path: string): Promise<T> {
  const res = await fetch(`${IREV_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`IReV request failed (${res.status}) for ${path}`);
  const body = (await res.json()) as IrevEnvelope<T>;
  return body.data;
}

export type IrevElection = {
  _id: string;
  full_name: string;
  election_id: number;
  election_date: string;
  state?: { name?: string } | null;
  domain?: { name?: string } | null;
  election_type?: { name?: string; code?: string } | null;
};

export type IrevStats = {
  pus: number;
  documents: number;
  latest?: { updated_at?: string } | null;
};

export type IrevWard = { _id: string; name: string; ward_id: number };

export type IrevLgaDetail = {
  lga?: { name?: string } | null;
  wards?: IrevWard[];
  total_registered?: number;
  total_accredited?: number;
  valid_votes?: number;
  invalid_votes?: number;
  total_votes?: number;
};

export type IrevRecentPu = {
  _id: string;
  name: string;
  pu_code: string;
  updated_at: string;
  polling_unit?: {
    lga?: { name?: string } | null;
    ward?: { name?: string } | null;
  } | null;
  document?: { url?: string; updated_at?: string } | null;
  old_documents?: unknown[];
};

export type Upload = {
  id: string;
  puName: string;
  puCode: string;
  lga: string;
  ward: string;
  sheetUrl: string | null;
  uploadedAt: string;
  replaced: boolean;
};

export type ElectionSummary = {
  id: string;
  name: string;
  date: string;
  type: string;
  area: string;
};

function toSummary(e: IrevElection): ElectionSummary {
  return {
    id: e._id,
    name: e.full_name,
    date: e.election_date,
    type: e.election_type?.name ?? "Election",
    area: e.domain?.name ?? e.state?.name ?? "Nigeria",
  };
}

export async function fetchElections(): Promise<ElectionSummary[]> {
  const data = await irevGet<IrevElection[]>("/elections/elections/latest");
  return data.slice(0, 12).map(toSummary);
}

export async function fetchStats(electionId: string) {
  const s = await irevGet<IrevStats>(`/elections/${electionId}/result/stats`);
  const pus = s.pus ?? 0;
  const documents = s.documents ?? 0;
  return {
    pollingUnits: pus,
    sheetsUploaded: documents,
    coverage: pus ? Math.min(100, (documents / pus) * 100) : 0,
    lastUploadAt: s.latest?.updated_at ?? null,
  };
}

export async function fetchRecentUploads(electionId: string, limit = 40): Promise<Upload[]> {
  const data = await irevGet<IrevRecentPu[]>(`/elections/${electionId}/pus/recent`);
  return data.slice(0, limit).map((p) => ({
    id: p._id,
    puName: p.name,
    puCode: p.pu_code,
    lga: p.polling_unit?.lga?.name ?? "—",
    ward: p.polling_unit?.ward?.name ?? "—",
    sheetUrl: p.document?.url ?? null,
    uploadedAt: p.document?.updated_at ?? p.updated_at,
    replaced: Array.isArray(p.old_documents) && p.old_documents.length > 0,
  }));
}

export type LgaRow = {
  id: string;
  name: string;
  wards: number;
  registered: number;
  accredited: number;
  validVotes: number;
  rejectedVotes: number;
  totalVotes: number;
};

export async function fetchLgas(electionId: string): Promise<LgaRow[]> {
  const data = await irevGet<
    Array<
      IrevLgaDetail & {
        _id: string;
        lga?: { _id?: string; name?: string } | null;
      }
    >
  >(`/elections/${electionId}/lga`);
  return data
    .map((l) => ({
      id: l.lga?._id ?? l._id,
      name: l.lga?.name ?? "Unknown LGA",
      wards: l.wards?.length ?? 0,
      registered: l.total_registered ?? 0,
      accredited: l.total_accredited ?? 0,
      validVotes: l.valid_votes ?? 0,
      rejectedVotes: l.invalid_votes ?? 0,
      totalVotes: l.total_votes ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------------------------------------------ *
 * Region drill-down: election -> LGA -> ward -> every polling unit.
 * IReV publishes structure and scanned Form EC8A sheets per polling
 * unit; it does not publish machine-readable party votes, so nothing
 * party-level is claimed here.
 * ------------------------------------------------------------------ */

export type WardNode = { id: string; name: string; code: string };
export type LgaNode = { id: string; name: string; code: string; wards: WardNode[] };

export async function fetchElectionStructure(electionId: string): Promise<LgaNode[]> {
  const data = await irevGet<
    Array<{
      _id: string;
      lga?: { _id?: string; name?: string; code?: string } | null;
      wards?: Array<{ _id: string; name: string; code?: string }>;
    }>
  >(`/elections/${electionId}/lga`);
  return data
    .map((l) => ({
      id: l.lga?._id ?? l._id,
      name: l.lga?.name ?? "Unknown LGA",
      code: l.lga?.code ?? "",
      wards: (l.wards ?? [])
        .map((w) => ({ id: w._id, name: w.name, code: w.code ?? "" }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type PuRow = {
  id: string;
  name: string;
  puCode: string;
  lga: string;
  ward: string;
  sheetUrl: string | null;
  uploadedAt: string | null;
  replaced: boolean;
};

export async function fetchWardPus(
  electionId: string,
  wardId: string,
): Promise<PuRow[]> {
  const data = await irevGet<IrevRecentPu[]>(
    `/elections/${electionId}/pus?ward=${encodeURIComponent(wardId)}`,
  );
  return data
    .map((p) => ({
      id: p._id,
      name: p.name,
      puCode: p.pu_code,
      lga: p.polling_unit?.lga?.name ?? "—",
      ward: p.polling_unit?.ward?.name ?? "—",
      sheetUrl: p.document?.url ?? null,
      uploadedAt: p.document?.updated_at ?? null,
      replaced: Array.isArray(p.old_documents) && p.old_documents.length > 0,
    }))
    .sort((a, b) => a.puCode.localeCompare(b.puCode));
}
