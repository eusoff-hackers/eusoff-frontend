"use client";

import React from "react";

import { cn } from "@/lib/utils";

import { ROUND_STATUS_LABEL, ROUND_STATUS_STYLE, nextRoundEvent } from "@/src/app/lib/rounds";
import type { RoundWindow } from "@/src/app/lib/rounds";
import { formatCountdown, formatSgtDay, formatSgtTime } from "@/src/app/lib/time";

interface RoundTimelineProps {
  rounds: RoundWindow[];
  now: number;
  /** Round to call out, e.g. the resident's own round. */
  highlightRound?: number;
  highlightLabel?: string;
  className?: string;
}

export function StatusPill({ status, className }: { status: RoundWindow["status"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[5px] border px-2 text-[11px] font-medium leading-none",
        ROUND_STATUS_STYLE[status] ?? ROUND_STATUS_STYLE.scheduled,
        className,
      )}
    >
      {status === "open" && (
        <span aria-hidden className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/60 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aqua" />
        </span>
      )}
      {ROUND_STATUS_LABEL[status] ?? status}
    </span>
  );
}

const done = (s: RoundWindow["status"]) => s === "allocated";
const live = (s: RoundWindow["status"]) => s === "open" || s === "closed" || s === "allocating";

/**
 * Four bidding rounds as a progress track: a rail that fills as rounds complete, with dates,
 * status and a live countdown to the next open/close.
 */
export default function RoundTimeline({
  rounds,
  now,
  highlightRound,
  highlightLabel = "Your round",
  className,
}: RoundTimelineProps) {
  const next = nextRoundEvent(rounds, now);
  const sorted = [...rounds].sort((a, b) => a.round - b.round);

  return (
    <ol className={cn("relative grid gap-0 md:grid-cols-4 md:gap-3", className)}>
      {sorted.map((r, i) => {
        const mine = highlightRound === r.round;
        const isNext = next?.round === r.round;
        const last = i === sorted.length - 1;
        return (
          <li
            key={r.round}
            aria-current={r.status === "open" ? "step" : undefined}
            className="relative flex min-w-0 gap-4 pb-5 last:pb-0 md:flex-col md:gap-3 md:pb-0"
          >
            {/* Rail: vertical on phones, horizontal from md */}
            <div className="relative flex w-3 shrink-0 flex-col items-center md:w-full md:flex-row">
              <span
                aria-hidden
                className={cn(
                  "relative z-[1] mt-1 h-3 w-3 shrink-0 rounded-full border md:mt-0",
                  done(r.status)
                    ? "border-lavender/60 bg-lavender/80"
                    : live(r.status)
                      ? "border-aqua bg-aqua"
                      : "border-white/25 bg-canvas",
                )}
              />
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-1/2 top-4 h-[calc(100%-0.25rem)] w-px -translate-x-1/2 md:left-4 md:top-1/2 md:h-px md:w-[calc(100%+0.75rem-1rem)] md:translate-x-0 md:-translate-y-1/2",
                    done(r.status) ? "bg-lavender/40" : "bg-white/[0.12]",
                  )}
                />
              )}
            </div>

            <div
              className={cn(
                "min-w-0 flex-1 rounded-xl px-0 md:-mx-1 md:px-1",
                mine && "md:bg-transparent",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-medium text-white">Round {r.round}</span>
                <StatusPill status={r.status} />
                {mine && (
                  <span className="inline-flex h-6 items-center rounded-[5px] bg-white/[0.08] px-2 text-[11px] font-medium text-mist">
                    {highlightLabel}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[13px] tabular-nums text-silver">
                {formatSgtDay(r.open)}, {formatSgtTime(r.open)} to{" "}
                {formatSgtDay(r.close) === formatSgtDay(r.open)
                  ? formatSgtTime(r.close)
                  : `${formatSgtDay(r.close)}, ${formatSgtTime(r.close)}`}
              </p>
              {isNext && next && (
                <p className="mt-1 text-[13px] font-medium tabular-nums text-aqua">
                  {next.kind === "opens" ? "Opens" : "Closes"} in {formatCountdown(next.at - now)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
