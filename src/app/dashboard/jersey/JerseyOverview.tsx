"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, CheckCircle2, Clock, Hourglass, Lock, OctagonAlert } from "lucide-react";

import type { PointsBreakdown, UserBid } from "@/src/app/dashboard/jersey/types";
import type { RoundWindow } from "@/src/app/lib/rounds";
import { formatCountdown, formatSgt } from "@/src/app/lib/time";
import type { User } from "@/src/app/redux/Resources/userSlice";

const BREAKDOWN_LABELS: { key: keyof PointsBreakdown; label: string }[] = [
  { key: "finalCut2526", label: "Final cut 25/26" },
  { key: "firstCut2627", label: "First cut 26/27" },
  { key: "captain", label: "Captaincy" },
  { key: "adjustment", label: "Adjustment" },
];

/** Name, matric and room. */
export function JerseyIdentity({ user, round }: { user: User; round: number }) {
  return (
    <header className="animate-fade-up">
      <p className="eyebrow">
        Round {round} <span className="mx-1.5 text-white/30">/</span> Jersey bidding 26/27
      </p>
      <h1 className="mt-3 break-words text-[1.875rem] font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.75rem]">
        {user.name ?? user.username}
      </h1>
      <p className="mt-2 text-sm tabular-nums text-silver">
        {user.username}
        {user.room && user.room !== "-" && <span className="text-[#93a19f]"> &nbsp;·&nbsp; Room {user.room}</span>}
      </p>
    </header>
  );
}

function Breakdown({ breakdown }: { breakdown: PointsBreakdown }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Points breakdown">
      {BREAKDOWN_LABELS.filter(b => b.key !== "adjustment" || breakdown.adjustment !== 0).map(b => (
        <li key={b.key} className="inline-flex h-8 items-center gap-2 rounded-md bg-recessed px-2.5 text-[13px] text-silver">
          {b.label}
          <span className="font-medium tabular-nums text-mist">
            {b.key === "adjustment" && breakdown.adjustment > 0 ? "+" : ""}
            {breakdown[b.key]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Teams({ teams }: { teams: UserBid["info"]["teams"] }) {
  return (
    <div>
      <p className="mb-2 text-[13px] text-silver">Teams</p>
      {teams.length === 0 ? (
        <p className="text-sm text-[#93a19f]">No teams on record.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {teams.map(({ team }) => (
            <li
              key={team.name}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[13px]",
                team.shareable ? "border-hairline text-mist" : "border-warn/30 text-warn",
              )}
            >
              {!team.shareable && <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
              {team.name}
              {!team.shareable && <span className="sr-only">(non-shareable)</span>}
            </li>
          ))}
        </ul>
      )}
      {teams.some(t => !t.team.shareable) && (
        <p className="mt-2 text-[13px] text-[#93a19f]">
          <Lock className="mr-1 inline h-3 w-3 align-[-1px]" strokeWidth={1.5} aria-hidden />
          Non-shareable: you can&apos;t take a number a teammate already holds.
        </p>
      )}
    </div>
  );
}

/** Once allocated, the number is the whole story: one wide card. */
export function AllocatedCard({ data }: { data: UserBid }) {
  const { info } = data;
  return (
    <section
      role="status"
      className="surface-card grid min-w-0 gap-6 overflow-hidden p-5 sm:p-8 md:grid-cols-[minmax(0,auto),1fr] md:gap-14"
    >
      <div>
        <p className="eyebrow flex items-center gap-2 text-lavender">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Your number
        </p>
        <p className="stat mt-5 text-[8rem] sm:text-[11rem]" aria-label={`Jersey number ${info.jersey!.number}`}>
          {info.jersey!.number}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-5 md:pt-10">
        <div>
          <h2 className="text-[1.375rem] font-medium leading-tight tracking-heading text-white sm:text-2xl">
            Number {info.jersey!.number} is yours
          </h2>
          <p className="mt-2 text-[15px] text-silver">
            {info.allocatedRound ? `Allocated in round ${info.allocatedRound}. ` : ""}This is your jersey number for IHG
            26/27. Nothing else to do.
          </p>
        </div>
        <div>
          <p className="mb-2 text-[13px] text-silver">
            <span className="tabular-nums text-mist">{info.points}</span> points
          </p>
          {info.breakdown && <Breakdown breakdown={info.breakdown} />}
        </div>
        <Teams teams={info.teams} />
      </div>
    </section>
  );
}

/** The big lavender stat: your points, with how they add up. */
export function PointsCard({ data }: { data: UserBid }) {
  const { info } = data;
  return (
    <section className="surface-card relative flex min-w-0 flex-col overflow-hidden p-5 sm:p-6" aria-label="Your points">
      <p className="eyebrow">Your points</p>
      <div className="mt-4 flex items-end gap-3">
        <p className="stat text-[5.5rem] sm:text-[7rem]">{info.points}</p>
        <p className="mb-2 text-sm text-silver">
          Breaks ties
          <br />
          on the same choice
        </p>
      </div>
      {info.breakdown && (
        <div className="mt-5">
          <Breakdown breakdown={info.breakdown} />
        </div>
      )}
      <div className="mt-5 border-t border-hairline pt-4">
        <Teams teams={info.teams} />
      </div>
    </section>
  );
}

type Tone = "info" | "open" | "wait" | "done" | "warn";

const TONE_ICON: Record<Tone, string> = {
  info: "text-silver",
  open: "text-aqua",
  wait: "text-warn",
  done: "text-lavender",
  warn: "text-warn",
};

const TONE_LABEL: Record<Tone, string> = {
  info: "Not yet",
  open: "Bidding open",
  wait: "Allocating",
  done: "Allocated",
  warn: "Action needed",
};

function StatusShell({
  tone,
  icon: Icon,
  title,
  children,
  countdown,
  action,
}: {
  tone: Tone;
  icon: React.ElementType;
  title: React.ReactNode;
  children?: React.ReactNode;
  countdown?: { label: string; at: number; now: number };
  action?: React.ReactNode;
}) {
  return (
    <section
      role="status"
      className={cn(
        "surface-card flex min-w-0 flex-col p-5 sm:p-6",
        tone === "open" && "border-aqua/25",
        tone === "warn" && "border-warn/30",
      )}
    >
      <p className={cn("eyebrow flex items-center gap-2", TONE_ICON[tone])}>
        <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        {TONE_LABEL[tone]}
      </p>
      <h2 className="mt-4 text-[1.375rem] font-medium leading-tight tracking-heading text-white sm:text-2xl">{title}</h2>
      {children && <div className="mt-2 text-[15px] text-silver">{children}</div>}
      {countdown && countdown.at > countdown.now && (
        <div className="mt-5 rounded-xl bg-recessed px-4 py-3">
          <p className="text-[13px] text-silver">{countdown.label}</p>
          <p className="mt-1 text-[1.75rem] font-medium leading-none tracking-[-0.02em] tabular-nums text-white">
            {formatCountdown(countdown.at - countdown.now)}
          </p>
        </div>
      )}
      {action && <div className="mt-5 sm:mt-auto sm:pt-5">{action}</div>}
    </section>
  );
}

export function StatusBanner({
  data,
  now,
  bidCount,
  onChoose,
}: {
  data: UserBid;
  now: number;
  bidCount: number;
  onChoose?: () => void;
}) {
  const { info, system, canBid } = data;
  const rounds: RoundWindow[] = system.rounds ?? [];
  const mine = rounds.find(r => r.round === info.round);

  if (info.isAllocated && info.jersey) {
    return (
      <StatusShell tone="done" icon={CheckCircle2} title={`Number ${info.jersey.number} is yours`}>
        {info.allocatedRound ? `Allocated in round ${info.allocatedRound}. ` : ""}This is your jersey number for IHG 26/27.
        Nothing else to do.
      </StatusShell>
    );
  }

  if (data.blockedReason) {
    return (
      <StatusShell tone="warn" icon={OctagonAlert} title="You can't bid yet">
        {data.blockedReason}
      </StatusShell>
    );
  }

  if (canBid) {
    const openRound = rounds.find(r => r.status === "open");
    const closeAt = openRound?.close ?? system.bidClose;
    return (
      <StatusShell
        tone="open"
        icon={Clock}
        title={bidCount === 0 ? "Pick your five numbers" : `${bidCount} of 5 choices saved`}
        countdown={closeAt ? { label: "Round closes in", at: closeAt, now } : undefined}
        action={
          onChoose && (
            <Button variant="cta" size="lg" className="w-full" onClick={onChoose}>
              {bidCount === 0 ? "Choose numbers" : "Edit choices"}
              <ArrowDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>
          )
        }
      >
        Order matters: numbers are allocated by choice rank, then points.
        {closeAt ? ` You can change them until ${formatSgt(closeAt)}.` : ""}
      </StatusShell>
    );
  }

  if (mine?.status === "scheduled") {
    return (
      <StatusShell
        tone="info"
        icon={Clock}
        title={`You bid in round ${info.round}`}
        countdown={mine.open > now ? { label: "Your round opens in", at: mine.open, now } : undefined}
      >
        Bidding opens {formatSgt(mine.open)}. Numbers taken in earlier rounds will be greyed out.
      </StatusShell>
    );
  }

  if (mine?.status === "open") {
    return (
      <StatusShell tone="warn" icon={Lock} title="Bidding is unavailable for you">
        Round {info.round} is open, but your account can&apos;t bid. Contact the jersey committee if this looks wrong.
      </StatusShell>
    );
  }

  if (mine && (mine.status === "closed" || mine.status === "allocating")) {
    return (
      <StatusShell tone="wait" icon={Hourglass} title="Waiting for allocation">
        Round {info.round} has closed. Numbers are allocated by choice rank, then points, then seniority. Check back
        shortly.
      </StatusShell>
    );
  }

  if (mine?.status === "allocated") {
    return (
      <StatusShell tone="warn" icon={Hourglass} title="No number from your round">
        None of your choices were free in round {info.round}. Contact the jersey committee for next steps.
      </StatusShell>
    );
  }

  return (
    <StatusShell tone="info" icon={Clock} title="Bidding isn't open for you right now">
      Check the round schedule below.
    </StatusShell>
  );
}
