export interface UserInfo {
  round: number;
  points: number;
  isAllocated: boolean;
  jersey?: JerseyType; // Only present if isAllocated is true
  teams: Team[];
}

export interface JerseyType {
  number: number;
  quota: Quota;
}

export interface Quota {
  male: number;
  female: number;
}

interface Team {
  name: string;
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
