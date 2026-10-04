"use client";

import React from "react";

import { cn } from "@/lib/utils";

import { ROUND_STATUS_LABEL, ROUND_STATUS_STYLE, nextRoundEvent } from "@/src/app/lib/rounds";
import type { RoundWindow } from "@/src/app/lib/rounds";
import { formatCountdown, formatSgtDay, formatSgtTime } from "@/src/app/lib/time";

interface RoundTimelineProps {
  rounds: RoundWindow[];
  now: number;
  /** Round to mark as "Your round". */
  highlightRound?: number;
  className?: string;
}

export function StatusPill({ status, className }: { status: RoundWindow["status"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        ROUND_STATUS_STYLE[status] ?? ROUND_STATUS_STYLE.scheduled,
        className,
      )}
    >
      {status === "open" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />}
      {ROUND_STATUS_LABEL[status] ?? status}
    </span>
  );
}

/** Four bidding rounds with status and a live countdown to the next open/close. */
export default function RoundTimeline({ rounds, now, highlightRound, className }: RoundTimelineProps) {
  const next = nextRoundEvent(rounds, now);
  const sorted = [...rounds].sort((a, b) => a.round - b.round);

  return (
    <ol className={cn("grid gap-2 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {sorted.map(r => {
        const mine = highlightRound === r.round;
        const isNext = next?.round === r.round;
        return (
          <li
            key={r.round}
            aria-current={r.status === "open" ? "step" : undefined}
            className={cn(
              "flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-3",
              r.status === "open" && "border-emerald-300 bg-emerald-50/50",
              mine && "ring-2 ring-amber-400 ring-offset-1",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold">
                Round {r.round}
                {mine && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                    Your round
                  </span>
                )}
              </span>
              <StatusPill status={r.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatSgtDay(r.open)} · {formatSgtTime(r.open)} –{" "}
              {formatSgtDay(r.close) === formatSgtDay(r.open)
                ? formatSgtTime(r.close)
                : `${formatSgtDay(r.close)} ${formatSgtTime(r.close)}`}
            </p>
            {isNext && next && (
              <p className="text-sm font-medium tabular-nums text-emerald-800">
                {next.kind === "opens" ? "Opens" : "Closes"} in {formatCountdown(next.at - now)}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
