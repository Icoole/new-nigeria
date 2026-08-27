/**
 * 2027 general election contest directory.
 *
 * Nigeria elects 1 president, 28 governors in the general cycle (8 states run
 * off-cycle), 109 senators and 360 House of Representatives members. The
 * directory below is generated from the constitutional seat allocation per
 * state so every contest has a permanent route-friendly identifier.
 */
export type ContestType = "Presidential" | "Governorship" | "Senate" | "House";

export type StateSeats = {
  state: string;
  zone: string;
  senate: number;
  house: number;
  offCycleGov: boolean;
};

export const STATE_SEATS: StateSeats[] = [
  { state: "Abia", zone: "South East", senate: 3, house: 8, offCycleGov: false },
  { state: "Adamawa", zone: "North East", senate: 3, house: 8, offCycleGov: false },
  { state: "Akwa Ibom", zone: "South South", senate: 3, house: 10, offCycleGov: false },
  { state: "Anambra", zone: "South East", senate: 3, house: 11, offCycleGov: true },
  { state: "Bauchi", zone: "North East", senate: 3, house: 12, offCycleGov: false },
  { state: "Bayelsa", zone: "South South", senate: 3, house: 5, offCycleGov: true },
  { state: "Benue", zone: "North Central", senate: 3, house: 11, offCycleGov: false },
  { state: "Borno", zone: "North East", senate: 3, house: 10, offCycleGov: false },
  { state: "Cross River", zone: "South South", senate: 3, house: 8, offCycleGov: false },
  { state: "Delta", zone: "South South", senate: 3, house: 10, offCycleGov: false },
  { state: "Ebonyi", zone: "South East", senate: 3, house: 6, offCycleGov: false },
  { state: "Edo", zone: "South South", senate: 3, house: 9, offCycleGov: true },
  { state: "Ekiti", zone: "South West", senate: 3, house: 6, offCycleGov: true },
  { state: "Enugu", zone: "South East", senate: 3, house: 8, offCycleGov: false },
  { state: "FCT", zone: "North Central", senate: 1, house: 2, offCycleGov: true },
  { state: "Gombe", zone: "North East", senate: 3, house: 6, offCycleGov: false },
  { state: "Imo", zone: "South East", senate: 3, house: 10, offCycleGov: true },
  { state: "Jigawa", zone: "North West", senate: 3, house: 11, offCycleGov: false },
  { state: "Kaduna", zone: "North West", senate: 3, house: 16, offCycleGov: false },
  { state: "Kano", zone: "North West", senate: 3, house: 24, offCycleGov: false },
  { state: "Katsina", zone: "North West", senate: 3, house: 15, offCycleGov: false },
  { state: "Kebbi", zone: "North West", senate: 3, house: 8, offCycleGov: false },
  { state: "Kogi", zone: "North Central", senate: 3, house: 9, offCycleGov: true },
  { state: "Kwara", zone: "North Central", senate: 3, house: 6, offCycleGov: false },
  { state: "Lagos", zone: "South West", senate: 3, house: 24, offCycleGov: false },
  { state: "Nasarawa", zone: "North Central", senate: 3, house: 5, offCycleGov: false },
  { state: "Niger", zone: "North Central", senate: 3, house: 10, offCycleGov: false },
  { state: "Ogun", zone: "South West", senate: 3, house: 9, offCycleGov: false },
  { state: "Ondo", zone: "South West", senate: 3, house: 9, offCycleGov: true },
  { state: "Osun", zone: "South West", senate: 3, house: 9, offCycleGov: true },
  { state: "Oyo", zone: "South West", senate: 3, house: 14, offCycleGov: false },
  { state: "Plateau", zone: "North Central", senate: 3, house: 8, offCycleGov: false },
  { state: "Rivers", zone: "South South", senate: 3, house: 13, offCycleGov: false },
  { state: "Sokoto", zone: "North West", senate: 3, house: 11, offCycleGov: false },
  { state: "Taraba", zone: "North East", senate: 3, house: 6, offCycleGov: false },
  { state: "Yobe", zone: "North East", senate: 3, house: 6, offCycleGov: false },
  { state: "Zamfara", zone: "North West", senate: 3, house: 7, offCycleGov: false },
];

export type Contest = {
  id: string;
  type: ContestType;
  title: string;
  state: string;
  zone: string;
  seats: number;
  status: "Planned" | "Scheduled";
};

export function buildContests(): Contest[] {
  const out: Contest[] = [
    {
      id: "presidential-2027",
      type: "Presidential",
      title: "Presidential election",
      state: "Nationwide",
      zone: "Federal",
      seats: 1,
      status: "Scheduled",
    },
  ];
  for (const s of STATE_SEATS) {
    if (!s.offCycleGov) {
      out.push({
        id: `gov-${slug(s.state)}-2027`,
        type: "Governorship",
        title: `${s.state} governorship`,
        state: s.state,
        zone: s.zone,
        seats: 1,
        status: "Scheduled",
      });
    }
    out.push({
      id: `senate-${slug(s.state)}-2027`,
      type: "Senate",
      title: `${s.state} senatorial districts`,
      state: s.state,
      zone: s.zone,
      seats: s.senate,
      status: "Planned",
    });
    out.push({
      id: `house-${slug(s.state)}-2027`,
      type: "House",
      title: `${s.state} federal constituencies`,
      state: s.state,
      zone: s.zone,
      seats: s.house,
      status: "Planned",
    });
  }
  return out;
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function totalSeats() {
  const c = buildContests();
  return c.reduce((sum, x) => sum + x.seats, 0);
}
