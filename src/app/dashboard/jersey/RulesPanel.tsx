"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { ArrowUpRight, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";

import type { RoundWindow } from "@/src/app/lib/rounds";
import { formatSgtDay, formatSgtTime } from "@/src/app/lib/time";

/** Committee-confirmed rules, condensed. Dates come from the live schedule when available. */
const ROUND_RULES: { round: number; who: string; fallback: string }[] = [
  { round: 1, who: "3+ IHGs", fallback: "Wed 7 Oct" },
  { round: 2, who: "2 IHGs", fallback: "Thu 8 Oct" },
  { round: 3, who: "1 IHG", fallback: "Fri 9 Oct" },
  { round: 4, who: "Never played", fallback: "Sat 10 Oct" },
];

const NO_SHARE_TEAMS = "Basketball, Floorball, Frisbee, Handball, Soccer, Softball, Touch Rugby, Volleyball";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-3.5 first:border-0 first:pt-0">
      <h3 className="mb-1.5 text-[13px] font-semibold text-heading">{title}</h3>
      <div className="space-y-1.5 text-[13px] leading-snug text-silver">{children}</div>
    </section>
  );
}

function RulesBody({ rounds, myRound }: { rounds: RoundWindow[]; myRound?: number }) {
  return (
    <div className="space-y-3.5">
      <Block title="Bidding">
        <p>Bid your top 5 numbers in order. Your latest submission before the round closes is the one that counts.</p>
      </Block>

      <Block title="Rounds">
        <ol className="space-y-1">
          {ROUND_RULES.map(r => {
            const live = rounds.find(x => x.round === r.round);
            const mine = r.round === myRound;
            return (
              <li
                key={r.round}
                className={cn(
                  "grid grid-cols-[2.25rem,1fr] items-baseline gap-x-2 rounded-md px-2 py-1",
                  mine ? "bg-lavender-fill text-on-accent" : "",
                )}
              >
                <span className={cn("font-semibold tabular-nums", mine ? "" : "text-heading")}>R{r.round}</span>
                <span className="min-w-0">
                  <span className={mine ? "font-medium" : "text-mist"}>{r.who}</span>
                  <span className={cn("block text-[12px] tabular-nums", mine ? "opacity-80" : "text-faint")}>
                    {live
                      ? `${formatSgtDay(live.open)}, ${formatSgtTime(live.open)} to ${formatSgtTime(live.close)}`
                      : `${r.fallback}, 9am to 9pm`}
                    {mine && " (your round)"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <p>No number in your round? You can bid again in later rounds.</p>
      </Block>

      <Block title="Allocation">
        <p>Not first come, first served. Numbers go by:</p>
        <ol className="list-decimal space-y-0.5 pl-5 marker:text-faint">
          <li>your choice ranking</li>
          <li>points</li>
          <li>seniority</li>
          <li>random tie-break</li>
        </ol>
      </Block>

      <Block title="Sharing">
        <ul className="list-disc space-y-1 pl-5 marker:text-faint">
          <li>Round 1: one person per gender per number, and that number stays closed to their gender afterwards.</li>
          <li>From Round 2: up to 3 per gender per number.</li>
          <li>#0 to #9 are never shared.</li>
          <li>
            No sharing within: {NO_SHARE_TEAMS}. Frisbee and Softball also can&apos;t share across genders.
          </li>
        </ul>
      </Block>

      <Block title="After that">
        <p>A number closes once its quota is full. After Round 4, anyone still without a number is given an available one.</p>
        <p>Teammates&apos; bids are shown by room number only (PDPA).</p>
      </Block>

      <Link
        href="/dashboard/instructions"
        className="inline-flex h-10 items-center gap-1 rounded-md text-[13px] font-medium text-aqua underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
      >
        Full rules <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </Link>
    </div>
  );
}

/** Desktop: sticky side panel. */
export function RulesAside({ rounds, myRound }: { rounds: RoundWindow[]; myRound?: number }) {
  return (
    <aside
      aria-labelledby="rules-heading"
      className="surface-card sticky top-24 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain p-5"
    >
      <h2 id="rules-heading" className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-heading">
        <BookOpen className="h-4 w-4 text-silver" strokeWidth={1.75} aria-hidden /> How it works
      </h2>
      <RulesBody rounds={rounds} myRound={myRound} />
    </aside>
  );
}

/** Phones/tablets: collapsed card placed just above the grid. */
export function RulesCard({
  rounds,
  myRound,
  className,
}: {
  rounds: RoundWindow[];
  myRound?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className={cn("surface-card overflow-hidden", className)} aria-labelledby="rules-card-heading">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="rules-card-body"
        className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua sm:px-6"
      >
        <BookOpen className="h-[18px] w-[18px] shrink-0 text-silver" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="rules-card-heading" className="text-[17px] font-medium tracking-heading text-heading">
            How it works
          </h2>
          <p className="text-[13px] text-silver">Rounds, allocation order and sharing rules</p>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-silver transition-transform duration-200 ease-out", open && "rotate-180")}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
      {open && (
        <div id="rules-card-body" className="animate-fade-up border-t border-hairline px-4 pb-4 pt-4 sm:px-6">
          <RulesBody rounds={rounds} myRound={myRound} />
        </div>
      )}
    </section>
  );
}
