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

/** Tailwind classes for a small status pill. */
export const ROUND_STATUS_STYLE: Record<RoundStatus, string> = {
  scheduled: "border-slate-200 bg-slate-50 text-slate-700",
  open: "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed: "border-amber-200 bg-amber-50 text-amber-800",
  allocating: "border-amber-300 bg-amber-100 text-amber-900",
  allocated: "border-emerald-900/20 bg-emerald-900 text-emerald-50",
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
