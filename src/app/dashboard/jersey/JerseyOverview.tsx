"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Hourglass, Lock, Megaphone } from "lucide-react";

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

export function JerseyHeader({ user, data }: { user: User; data: UserBid }) {
  const { info } = data;
  const breakdown = info.breakdown;

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 bg-emerald-950 px-4 py-4 text-white sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Jersey bidding 26/27</p>
          <h1 className="mt-1 break-words text-xl font-semibold sm:text-2xl">{user.name ?? user.username}</h1>
          <p className="text-sm text-emerald-50/70">
            {user.username} · Room {user.room}
          </p>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
          <p className="text-[11px] uppercase tracking-wide text-emerald-50/70">Your round</p>
          <p className="text-2xl font-bold tabular-nums text-amber-300">{info.round}</p>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-[auto,1fr] sm:items-start sm:gap-6 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Points</p>
          <p className="text-4xl font-bold tabular-nums text-emerald-900">{info.points}</p>
        </div>
        <div className="min-w-0 space-y-3">
          {breakdown && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Points breakdown">
              {BREAKDOWN_LABELS.filter(b => b.key !== "adjustment" || breakdown.adjustment !== 0).map(b => (
                <li
                  key={b.key}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-slate-50 px-2.5 py-1 text-xs"
                >
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-semibold tabular-nums">
                    {b.key === "adjustment" && breakdown.adjustment > 0 ? "+" : ""}
                    {breakdown[b.key]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Teams</p>
            {info.teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teams on record.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {info.teams.map(({ team }) => (
                  <li
                    key={team.name}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      team.shareable ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
                    )}
                    title={
                      team.shareable ? undefined : "Non-shareable: you can't take a number a teammate already holds"
                    }
                  >
                    {!team.shareable && <Lock className="h-3 w-3" aria-label="Non-shareable" />}
                    {team.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type Tone = "info" | "open" | "wait" | "done" | "warn";

const TONES: Record<Tone, string> = {
  info: "border-slate-200 bg-white",
  open: "border-emerald-300 bg-emerald-50",
  wait: "border-amber-200 bg-amber-50",
  done: "border-emerald-900 bg-emerald-950 text-white",
  warn: "border-amber-300 bg-amber-50",
};

function Banner({
  tone,
  icon: Icon,
  title,
  children,
  aside,
}: {
  tone: Tone;
  icon: React.ElementType;
  title: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section
      role="status"
      className={cn("flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:p-5", TONES[tone])}
    >
      <Icon
        className={cn("hidden h-8 w-8 shrink-0 sm:block", tone === "done" ? "text-amber-300" : "text-emerald-800")}
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {children && (
          <div className={cn("mt-0.5 text-sm", tone === "done" ? "text-emerald-50/80" : "text-muted-foreground")}>
            {children}
          </div>
        )}
      </div>
      {aside}
    </section>
  );
}

function Countdown({ label, at, now }: { label: string; at: number; now: number }) {
  return (
    <div className="shrink-0 rounded-lg bg-white/70 px-3 py-2 text-left sm:text-right">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{formatCountdown(at - now)}</p>
    </div>
  );
}

export function StatusBanner({ data, now, bidCount }: { data: UserBid; now: number; bidCount: number }) {
  const { info, system, canBid } = data;
  const rounds: RoundWindow[] = system.rounds ?? [];
  const mine = rounds.find(r => r.round === info.round);

  if (info.isAllocated && info.jersey) {
    return (
      <Banner
        tone="done"
        icon={CheckCircle2}
        title="You've been allocated your number"
        aside={
          <div className="flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-xl bg-amber-300 text-5xl font-bold tabular-nums text-emerald-950 sm:self-auto">
            {info.jersey.number}
          </div>
        }
      >
        {info.allocatedRound ? `Allocated in round ${info.allocatedRound}.` : null} This is your jersey number for IHG
        26/27.
      </Banner>
    );
  }

  if (canBid) {
    const openRound = rounds.find(r => r.status === "open");
    const closeAt = openRound?.close ?? system.bidClose;
    return (
      <Banner
        tone="open"
        icon={Megaphone}
        title="Bidding is open — submit your top 5"
        aside={closeAt > now ? <Countdown label="Closes in" at={closeAt} now={now} /> : undefined}
      >
        Pick up to 5 numbers in order of preference below ({bidCount}/5 chosen). You can change them until the round
        closes{closeAt ? ` at ${formatSgt(closeAt)}` : ""}.
      </Banner>
    );
  }

  if (mine?.status === "scheduled") {
    return (
      <Banner
        tone="info"
        icon={Clock}
        title={`Not your round yet — you bid in round ${info.round}`}
        aside={mine.open > now ? <Countdown label="Opens in" at={mine.open} now={now} /> : undefined}
      >
        Bidding for round {info.round} opens {formatSgt(mine.open)}. Numbers already taken in earlier rounds will be
        greyed out.
      </Banner>
    );
  }

  if (mine?.status === "open") {
    return (
      <Banner tone="warn" icon={Lock} title={`Round ${info.round} is open, but bidding is unavailable for you`}>
        If you think this is a mistake, please contact the jersey committee.
      </Banner>
    );
  }

  if (mine && (mine.status === "closed" || mine.status === "allocating")) {
    return (
      <Banner tone="wait" icon={Hourglass} title="Waiting for allocation">
        Round {info.round} has closed. Numbers are allocated by choice rank, then points, then seniority — check back
        shortly.
      </Banner>
    );
  }

  if (mine?.status === "allocated") {
    return (
      <Banner tone="warn" icon={Hourglass} title={`Round ${info.round} has been allocated`}>
        You didn&apos;t receive a number in your round. Please contact the jersey committee for next steps.
      </Banner>
    );
  }

  return (
    <Banner tone="info" icon={Clock} title="Bidding isn't open for you right now">
      Check the round schedule below.
    </Banner>
  );
}
