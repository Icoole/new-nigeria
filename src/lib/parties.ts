/**
 * Political parties currently registered with INEC and appearing on IReV
 * result sheets (Form EC8A). Codes match the party column on the forms.
 */
export type Party = {
  code: string;
  name: string;
  color: string;
};

export const PARTIES: Party[] = [
  { code: "A", name: "Accord", color: "oklch(0.72 0.14 55)" },
  { code: "AA", name: "Action Alliance", color: "oklch(0.7 0.15 140)" },
  { code: "AAC", name: "African Action Congress", color: "oklch(0.66 0.16 20)" },
  { code: "ADC", name: "African Democratic Congress", color: "oklch(0.74 0.15 95)" },
  { code: "ADP", name: "Action Democratic Party", color: "oklch(0.68 0.13 200)" },
  { code: "APC", name: "All Progressives Congress", color: "oklch(0.7 0.17 150)" },
  { code: "APGA", name: "All Progressives Grand Alliance", color: "oklch(0.72 0.12 120)" },
  { code: "APM", name: "Allied Peoples Movement", color: "oklch(0.66 0.12 260)" },
  { code: "APP", name: "Action Peoples Party", color: "oklch(0.7 0.13 310)" },
  { code: "BP", name: "Boot Party", color: "oklch(0.64 0.12 40)" },
  { code: "LP", name: "Labour Party", color: "oklch(0.75 0.16 145)" },
  { code: "NNPP", name: "New Nigeria Peoples Party", color: "oklch(0.7 0.15 240)" },
  { code: "NRM", name: "National Rescue Movement", color: "oklch(0.68 0.11 180)" },
  { code: "PDP", name: "Peoples Democratic Party", color: "oklch(0.68 0.16 25)" },
  { code: "PRP", name: "Peoples Redemption Party", color: "oklch(0.66 0.14 75)" },
  { code: "SDP", name: "Social Democratic Party", color: "oklch(0.7 0.14 285)" },
  { code: "YPP", name: "Young Progressives Party", color: "oklch(0.72 0.14 170)" },
  { code: "ZLP", name: "Zenith Labour Party", color: "oklch(0.68 0.13 330)" },
];
