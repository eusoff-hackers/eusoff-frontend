/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RoundWindow } from "@/src/app/lib/rounds";

export interface PointsBreakdown {
  finalCut2526: number;
  firstCut2627: number;
  captain: number;
  adjustment: number;
}

export interface UserInfo {
  round: number;
  points: number;
  isAllocated: boolean;
  jersey?: JerseyType; // Only present if isAllocated is true
  allocatedRound?: number;
  breakdown?: PointsBreakdown;
  teams: TeamContainer[];
}

export interface JerseyType {
  number: number;
  quota: Quota;
}

export interface EligibleBids {
  jerseys: number[];
}

export interface Quota {
  male: number;
  female: number;
}

export interface Team {
  name: string;
  shareable: boolean;
}

interface TeamContainer {
  team: Team;
}

export interface Bid {
  jersey: Pick<JerseyType, "number">;
  priority: number; // 0 = top choice
  round?: number;
}

interface System {
  bidOpen: number; // epoch ms, current/next round window
  bidClose: number;
  bidRound: number;
  rounds?: RoundWindow[];
}

export interface UserBid {
  info: UserInfo;
  bids: Bid[];
  system: System;
  canBid: boolean;
}

export interface Bidding {
  male: any[];
  female: any[];
  quota: Quota;
}

export interface BiddingData {
  [jerseyNumber: number]: Bidding;
}
