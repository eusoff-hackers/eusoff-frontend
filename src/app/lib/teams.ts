/** Resident-facing names for team codes from the IHG records. Unknown codes pass through unchanged. */
const TEAM_NAMES: Record<string, string> = {
  Ulti: "Ultimate Frisbee",
  Takraw: "Sepak Takraw",
  "RR M": "Road Relay M",
  "RR F": "Road Relay F",
  "Trug M": "Touch Rugby M",
  "Trug F": "Touch Rugby F",
};

export const teamName = (code: string) => TEAM_NAMES[code] ?? code;
