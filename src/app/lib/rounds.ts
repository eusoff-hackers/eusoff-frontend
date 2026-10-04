export type RoundStatus = "scheduled" | "open" | "closed" | "allocating" | "allocated";

export interface RoundWindow {
  round: number;
  open: number;
  close: number;
  status: RoundStatus;
}

export const ROUND_STATUS_LABEL: Record<RoundStatus, string> = {
  scheduled: "Scheduled",
  open: "Open",
  closed: "Closed",
  allocating: "Allocating",
  allocated: "Allocated",
};

/** Tailwind classes for a small status pill (dark-teal system, AA on every surface). */
export const ROUND_STATUS_STYLE: Record<RoundStatus, string> = {
  scheduled: "border-white/15 bg-white/[0.04] text-silver",
  open: "border-aqua/35 bg-aqua/10 text-aqua",
  closed: "border-warn/35 bg-warn/10 text-warn",
  allocating: "border-warn/35 bg-warn/10 text-warn",
  allocated: "border-lavender/30 bg-lavender/10 text-lavender",
};

export interface RoundEvent {
  round: number;
  kind: "opens" | "closes";
  at: number;
}

/** The next upcoming open/close moment across all rounds, judged by the backend's status. */
export function nextRoundEvent(rounds: RoundWindow[] | undefined, now: number): RoundEvent | null {
  if (!rounds) return null;
  const events: RoundEvent[] = [];
  for (const r of rounds) {
    if (r.status === "scheduled" && r.open > now) events.push({ round: r.round, kind: "opens", at: r.open });
    if ((r.status === "scheduled" || r.status === "open") && r.close > now) {
      events.push({ round: r.round, kind: "closes", at: r.close });
    }
  }
  events.sort((a, b) => a.at - b.at);
  return events[0] ?? null;
}
