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
  gender: Gender;
  year: number;
  role: string;
  email: string;
  round: number;
  points: number;
  breakdown: Breakdown;
  teams: string[];
  isAllocated: boolean;
  jersey: number | null;
  allocatedRound: number | null;
  bids: AdminBid[];
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
  gender: Gender;
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
