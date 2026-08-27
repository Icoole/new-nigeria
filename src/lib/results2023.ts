/**
 * 2023 Nigerian presidential election — declared state-level totals for the
 * four leading parties, as announced by INEC at the national collation centre.
 *
 * These are the public declared figures used for the interactive map and the
 * Path to Aso Rock simulator. They are indicative reference values for the four
 * leading parties only; the authoritative record remains INEC's declaration and
 * the polling-unit Form EC8A scans published on IReV.
 */
export type PartyCode = "APC" | "PDP" | "LP" | "NNPP";

export const PARTY_META: Record<
  PartyCode,
  { name: string; candidate: string; color: string }
> = {
  APC: {
    name: "All Progressives Congress",
    candidate: "Bola Ahmed Tinubu",
    color: "oklch(0.74 0.16 155)",
  },
  PDP: {
    name: "Peoples Democratic Party",
    candidate: "Atiku Abubakar",
    color: "oklch(0.66 0.19 25)",
  },
  LP: {
    name: "Labour Party",
    candidate: "Peter Obi",
    color: "oklch(0.72 0.15 235)",
  },
  NNPP: {
    name: "New Nigeria Peoples Party",
    candidate: "Rabiu Musa Kwankwaso",
    color: "oklch(0.79 0.15 85)",
  },
};

export type StateResult = {
  state: string;
  zone: string;
  registered: number;
  votes: Record<PartyCode, number>;
};

export const STATE_RESULTS_2023: StateResult[] = [
  { state: "Abia", zone: "South East", registered: 2120808, votes: { APC: 8914, PDP: 22676, LP: 327095, NNPP: 2343 } },
  { state: "Adamawa", zone: "North East", registered: 2196566, votes: { APC: 182881, PDP: 417611, LP: 105648, NNPP: 5081 } },
  { state: "Akwa Ibom", zone: "South South", registered: 2357418, votes: { APC: 160620, PDP: 214012, LP: 132683, NNPP: 2373 } },
  { state: "Anambra", zone: "South East", registered: 2781420, votes: { APC: 5111, PDP: 9036, LP: 584621, NNPP: 4187 } },
  { state: "Bauchi", zone: "North East", registered: 2749268, votes: { APC: 316694, PDP: 426607, LP: 24819, NNPP: 71745 } },
  { state: "Bayelsa", zone: "South South", registered: 1056862, votes: { APC: 42572, PDP: 68818, LP: 49975, NNPP: 1975 } },
  { state: "Benue", zone: "North Central", registered: 2606787, votes: { APC: 310468, PDP: 130081, LP: 308372, NNPP: 3268 } },
  { state: "Borno", zone: "North East", registered: 2437965, votes: { APC: 252282, PDP: 190921, LP: 7205, NNPP: 4626 } },
  { state: "Cross River", zone: "South South", registered: 1766466, votes: { APC: 130520, PDP: 95425, LP: 179917, NNPP: 1644 } },
  { state: "Delta", zone: "South South", registered: 3221697, votes: { APC: 90183, PDP: 161600, LP: 341866, NNPP: 4272 } },
  { state: "Ebonyi", zone: "South East", registered: 1526480, votes: { APC: 42402, PDP: 13503, LP: 259738, NNPP: 1661 } },
  { state: "Edo", zone: "South South", registered: 2501081, votes: { APC: 144471, PDP: 89585, LP: 331163, NNPP: 2743 } },
  { state: "Ekiti", zone: "South West", registered: 987647, votes: { APC: 201494, PDP: 89554, LP: 11397, NNPP: 1014 } },
  { state: "Enugu", zone: "South East", registered: 1935168, votes: { APC: 4772, PDP: 15749, LP: 428640, NNPP: 1808 } },
  { state: "FCT", zone: "North Central", registered: 1570307, votes: { APC: 90902, PDP: 74194, LP: 281717, NNPP: 4517 } },
  { state: "Gombe", zone: "North East", registered: 1479329, votes: { APC: 146977, PDP: 319123, LP: 30193, NNPP: 19616 } },
  { state: "Imo", zone: "South East", registered: 2419922, votes: { APC: 66406, PDP: 30234, LP: 360495, NNPP: 2270 } },
  { state: "Jigawa", zone: "North West", registered: 2351298, votes: { APC: 421390, PDP: 386587, LP: 1889, NNPP: 98234 } },
  { state: "Kaduna", zone: "North West", registered: 4335208, votes: { APC: 399293, PDP: 554360, LP: 294494, NNPP: 92447 } },
  { state: "Kano", zone: "North West", registered: 5921370, votes: { APC: 517341, PDP: 131716, LP: 6747, NNPP: 997279 } },
  { state: "Katsina", zone: "North West", registered: 3516316, votes: { APC: 482283, PDP: 489045, LP: 6376, NNPP: 69386 } },
  { state: "Kebbi", zone: "North West", registered: 1932595, votes: { APC: 248088, PDP: 285175, LP: 3335, NNPP: 12935 } },
  { state: "Kogi", zone: "North Central", registered: 1932654, votes: { APC: 240751, PDP: 145104, LP: 56217, NNPP: 4238 } },
  { state: "Kwara", zone: "North Central", registered: 1695927, votes: { APC: 263572, PDP: 136909, LP: 30850, NNPP: 3141 } },
  { state: "Lagos", zone: "South West", registered: 7060195, votes: { APC: 572606, PDP: 75750, LP: 582454, NNPP: 8442 } },
  { state: "Nasarawa", zone: "North Central", registered: 1636229, votes: { APC: 172922, PDP: 147093, LP: 191361, NNPP: 3548 } },
  { state: "Niger", zone: "North Central", registered: 2657894, votes: { APC: 375183, PDP: 284898, LP: 80452, NNPP: 8529 } },
  { state: "Ogun", zone: "South West", registered: 2688305, votes: { APC: 341554, PDP: 123831, LP: 85829, NNPP: 3410 } },
  { state: "Ondo", zone: "South West", registered: 2053061, votes: { APC: 369924, PDP: 115463, LP: 44405, NNPP: 2682 } },
  { state: "Osun", zone: "South West", registered: 1955657, votes: { APC: 343945, PDP: 354366, LP: 23283, NNPP: 2053 } },
  { state: "Oyo", zone: "South West", registered: 3277487, votes: { APC: 449884, PDP: 182977, LP: 89215, NNPP: 4095 } },
  { state: "Plateau", zone: "North Central", registered: 2648958, votes: { APC: 307195, PDP: 243808, LP: 466272, NNPP: 6323 } },
  { state: "Rivers", zone: "South South", registered: 3537190, votes: { APC: 231591, PDP: 88468, LP: 175071, NNPP: 3868 } },
  { state: "Sokoto", zone: "North West", registered: 2172056, votes: { APC: 285444, PDP: 288679, LP: 6568, NNPP: 4038 } },
  { state: "Taraba", zone: "North East", registered: 1777105, votes: { APC: 135165, PDP: 189017, LP: 146315, NNPP: 5325 } },
  { state: "Yobe", zone: "North East", registered: 1485146, votes: { APC: 151459, PDP: 198567, LP: 4552, NNPP: 9500 } },
  { state: "Zamfara", zone: "North West", registered: 2096220, votes: { APC: 298396, PDP: 194384, LP: 10608, NNPP: 4044 } },
];

export const PARTY_CODES: PartyCode[] = ["APC", "PDP", "LP", "NNPP"];

export function stateTotal(r: StateResult) {
  return PARTY_CODES.reduce((s, c) => s + r.votes[c], 0);
}

export function leaderOf(r: StateResult): PartyCode {
  return PARTY_CODES.reduce((a, b) => (r.votes[b] > r.votes[a] ? b : a));
}

export function nationalTotals(rows: StateResult[]) {
  const totals = { APC: 0, PDP: 0, LP: 0, NNPP: 0 } as Record<PartyCode, number>;
  for (const r of rows) for (const c of PARTY_CODES) totals[c] += r.votes[c];
  return totals;
}

/** Number of states (incl. FCT) where a party cleared 25% of votes cast. */
export function spreadCount(rows: StateResult[], code: PartyCode) {
  return rows.filter((r) => {
    const t = stateTotal(r);
    return t > 0 && r.votes[code] / t >= 0.25;
  }).length;
}
