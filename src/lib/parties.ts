/**
 * Political parties registered with INEC and appearing on IReV result sheets
 * (Form EC8A). Codes match the party column on the forms. Candidate and
 * running-mate names are the ones INEC published on its final list of
 * presidential candidates for the 2023 general election.
 */
export type Party = {
  code: string;
  name: string;
  color: string;
  candidate2023: string;
  runningMate2023: string;
};

export const PARTIES: Party[] = [
  {
    code: "A",
    name: "Accord",
    color: "oklch(0.72 0.14 55)",
    candidate2023: "Christopher Imumolen",
    runningMate2023: "Bello Maru",
  },
  {
    code: "AA",
    name: "Action Alliance",
    color: "oklch(0.7 0.15 140)",
    candidate2023: "Hamza Al-Mustapha",
    runningMate2023: "Johnson Chukwu",
  },
  {
    code: "AAC",
    name: "African Action Congress",
    color: "oklch(0.66 0.16 20)",
    candidate2023: "Omoyele Sowore",
    runningMate2023: "Haruna Magashi",
  },
  {
    code: "ADC",
    name: "African Democratic Congress",
    color: "oklch(0.74 0.15 95)",
    candidate2023: "Dumebi Kachikwu",
    runningMate2023: "Ahmed Buhari",
  },
  {
    code: "ADP",
    name: "Action Democratic Party",
    color: "oklch(0.68 0.13 200)",
    candidate2023: "Yabagi Yusuf Sani",
    runningMate2023: "Udo Okoro",
  },
  {
    code: "APC",
    name: "All Progressives Congress",
    color: "oklch(0.7 0.17 150)",
    candidate2023: "Bola Ahmed Tinubu",
    runningMate2023: "Kashim Shettima",
  },
  {
    code: "APGA",
    name: "All Progressives Grand Alliance",
    color: "oklch(0.72 0.12 120)",
    candidate2023: "Peter Umeadi",
    runningMate2023: "Muhammed Koli",
  },
  {
    code: "APM",
    name: "Allied Peoples Movement",
    color: "oklch(0.66 0.12 260)",
    candidate2023: "Ojei Princess",
    runningMate2023: "Ibrahim Mohammed",
  },
  {
    code: "APP",
    name: "Action Peoples Party",
    color: "oklch(0.7 0.13 310)",
    candidate2023: "Osita Nnadi",
    runningMate2023: "Isa Hamisu",
  },
  {
    code: "BP",
    name: "Boot Party",
    color: "oklch(0.64 0.12 40)",
    candidate2023: "Sunday Adenuga",
    runningMate2023: "Mustapha Taraki",
  },
  {
    code: "LP",
    name: "Labour Party",
    color: "oklch(0.75 0.16 145)",
    candidate2023: "Peter Obi",
    runningMate2023: "Yusuf Datti Baba-Ahmed",
  },
  {
    code: "NNPP",
    name: "New Nigeria Peoples Party",
    color: "oklch(0.7 0.15 240)",
    candidate2023: "Rabiu Musa Kwankwaso",
    runningMate2023: "Isaac Idahosa",
  },
  {
    code: "NRM",
    name: "National Rescue Movement",
    color: "oklch(0.68 0.11 180)",
    candidate2023: "Felix Nicolas",
    runningMate2023: "Ojiego Chimaobi",
  },
  {
    code: "PDP",
    name: "Peoples Democratic Party",
    color: "oklch(0.68 0.16 25)",
    candidate2023: "Atiku Abubakar",
    runningMate2023: "Ifeanyi Okowa",
  },
  {
    code: "PRP",
    name: "Peoples Redemption Party",
    color: "oklch(0.66 0.14 75)",
    candidate2023: "Kola Abiola",
    runningMate2023: "Yusuf Mohammed",
  },
  {
    code: "SDP",
    name: "Social Democratic Party",
    color: "oklch(0.7 0.14 285)",
    candidate2023: "Adewole Adebayo",
    runningMate2023: "Yusuf Buba",
  },
  {
    code: "YPP",
    name: "Young Progressives Party",
    color: "oklch(0.72 0.14 170)",
    candidate2023: "Malik Ado-Ibrahim",
    runningMate2023: "Bashir Abdullahi",
  },
  {
    code: "ZLP",
    name: "Zenith Labour Party",
    color: "oklch(0.68 0.13 330)",
    candidate2023: "Dan Nwanyanwu",
    runningMate2023: "Ahmed Zakari",
  },
];

export function partyByCode(code: string) {
  return PARTIES.find((p) => p.code === code) ?? null;
}
