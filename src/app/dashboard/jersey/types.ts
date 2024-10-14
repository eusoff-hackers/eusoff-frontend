export interface UserInfo {
  round: number;
  points: number;
  isAllocated: boolean;
  jersey?: JerseyType; // Only present if isAllocated is true
<<<<<<< HEAD
  teams: Team[];
=======
  teams: TeamContainer[];
>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf
}

export interface JerseyType {
  number: number;
  quota: Quota;
}

<<<<<<< HEAD
=======
export interface EligibleBids {
  jerseys: number[];
}

>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf
export interface Quota {
  male: number;
  female: number;
}

interface Team {
  name: string;
<<<<<<< HEAD
=======
  shareable: boolean;
}

interface TeamContainer {
  team: Team;
>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf
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
