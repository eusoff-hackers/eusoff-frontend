import type { RoundWindow } from "@/src/app/lib/rounds";

export type Gender = "male" | "female";
export type PerRound = Record<string, number>;

export interface Breakdown {
  finalCut2526: number;
  firstCut2627: number;
  captain: number;
  adjustment: number;
}

export interface Round extends RoundWindow {
  allocatedAt?: number;
  summary?: { bidders: number; allocated: number; unallocatedBidders: number };
}

export interface Overview {
  now: number;
  residents: number;
  byRound: PerRound;
  byGender: { male: number; female: number };
  current: { round: number; open: number; close: number; phase: "before" | "open" | "between" | "done" };
  rounds: Round[];
  bidders: PerRound;
  allocated: PerRound;
  unallocated: number;
  issuesOpen: number;
  pointsDistribution: { points: number; count: number }[];
  topNumbers: { number: number; bids: number }[];
  recentActivity: { action: string; timestamp: number; user?: { name: string; room: string } }[];
}

export interface AdminBid {
  number: number;
  priority: number;
  round: number;
}

export interface AdminUser {
  _id: string;
  username: string;
  name: string;
  room: string;
  /** null until an admin sets it; such residents can't bid. */
  gender: Gender | null;
  year: number;
  role: string;
  email: string | null;
  round: number;
  points: number;
  breakdown: Breakdown;
  teams: string[];
  isAllocated: boolean;
  jersey: number | null;
  allocatedRound: number | null;
  bids: AdminBid[];
  /** Epoch ms of last successful login; null = never logged in. */
  lastLogin?: number | null;
}

export interface AdminUserPatch {
  name?: string;
  room?: string;
  gender?: Gender;
  year?: number;
  round?: number;
  email?: string;
  breakdown?: Breakdown;
}

export interface BidUser {
  _id: string;
  name: string;
  room: string;
  gender: Gender | null;
  points: number;
  year: number;
}

export interface AllocationPreview {
  results: { user: BidUser; number: number; choice: number }[];
  unallocated: { user: BidUser; choices: number[] }[];
}

export interface AdminJersey {
  number: number;
  quota: { male: number; female: number };
  defaultQuota: { male: number; female: number } | number;
  holders: { name: string; room: string; gender: Gender; round: number }[];
  bids: { male: number; female: number };
  bannedTeams: string[];
}

export interface RoundBids {
  user: BidUser;
  bids: { number: number; priority: number }[];
}

export interface Issue {
  _id: string;
  category: string;
  detail: string;
  resolved: boolean;
}

export interface Settings {
  allowLogin: boolean;
}

// ---- v2 additions ----

export interface AnalyticsRound {
  round: number;
  status: Round["status"];
  eligible: number;
  carryover: number;
  bidders: number;
  nonBidders: number;
  allocated: number;
  unallocatedBidders: number;
  /** Allocated with their 1st..5th choice. */
  choiceHits: number[];
}

export interface Analytics {
  generatedAt: number;
  coverage: { residents: number; allocated: number; unallocated: number; unknownGender: number; neverLoggedIn: number };
  rounds: AnalyticsRound[];
  /** Numbers 0..99, bids of the current round. */
  demand: { number: number; total: number; byChoice: number[]; male: number; female: number; holders: number }[];
  teams: { team: string; members: number; allocated: number; bidders: number }[];
  points: { points: number; residents: number; allocated: number; gotTopChoice: number }[];
  activity: {
    loginsByHour: { hour: number; count: number }[];
    bidsByHour: { hour: number; count: number }[];
    uniqueLogins: number;
  };
}

export interface NonBidder {
  _id: string;
  name: string;
  username: string;
  room: string;
  gender: Gender | null;
  /** Their own round. */
  round: number;
  points: number;
  /** From an earlier round and still without a number (optional bidder). */
  carryover: boolean;
  lastLogin: number | null;
}

export interface AssignUser {
  _id: string;
  name: string;
  room: string;
  gender: Gender | null;
  points: number;
  round: number;
}

export interface AssignPreview {
  results: { user: AssignUser; number: number }[];
  impossible: { user: AssignUser; reason: string }[];
}

export interface AssignResult {
  assigned: number;
  impossible: AssignPreview["impossible"] | number;
}
