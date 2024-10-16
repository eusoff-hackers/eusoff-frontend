export interface UserInfo {
  round: number;
  points: number;
  isAllocated: boolean;
  jersey?: JerseyType; // Only present if isAllocated is true
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

interface Team {
  name: string;
  shareable: boolean;
}

interface TeamContainer {
  team: Team;
}

interface Bid {
  jersey: JerseyType;
  priority: number;
}

interface System {
  bidOpen: string; // Assuming it's a string (ISO date)
  bidClose: string; // Assuming it's a string (ISO date)
  bidRound: number;
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
