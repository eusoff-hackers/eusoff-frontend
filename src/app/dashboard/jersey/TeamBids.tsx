"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { ChevronDown, Lock, Users } from "lucide-react";

import type { BiddingData, Team } from "@/src/app/dashboard/jersey/types";
import { teamName } from "@/src/app/lib/teams";

interface ListBidder {
  user?: { room?: string; gender?: string };
  teams?: { team?: { name?: string; shareable?: boolean } }[];
}

/** Rows shown per team before "Show all". */
const ROW_CAP = 6;

interface Teammate {
  room: string;
  numbers: number[];
}

/**
 * Per the rules, residents can see the numbers their teammates are bidding on, identified only by
 * room number (PDPA). /jersey/list has no priority, so numbers are shown sorted as "bidding on".
 */
function teammatesByTeam(biddings: BiddingData | undefined, teams: Team[], myRoom: string | undefined) {
  const byTeam = new Map<string, Map<string, Set<number>>>(teams.map(t => [t.name, new Map()]));
  if (!biddings) return byTeam;
  for (const [key, entry] of Object.entries(biddings)) {
    const number = Number(key);
    const bidders = [...(entry?.male ?? []), ...(entry?.female ?? [])] as ListBidder[];
    for (const b of bidders) {
      const room = b.user?.room;
      if (!room || room === myRoom) continue;
      for (const t of b.teams ?? []) {
        const rooms = t.team?.name ? byTeam.get(t.team.name) : undefined;
        if (!rooms) continue;
        if (!rooms.has(room)) rooms.set(room, new Set());
        rooms.get(room)!.add(number);
      }
    }
  }
  return byTeam;
}

export default function TeamBids({
  teams,
  biddings,
  myRoom,
  myPicks,
}: {
  teams: Team[];
  biddings: BiddingData | undefined;
  myRoom: string | undefined;
  myPicks: number[];
}) {
  // Collapsed by default everywhere: the summary line carries the signal, the list is on demand.
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const data = useMemo(() => {
    const grouped = teammatesByTeam(biddings, teams, myRoom);
    return teams.map(team => {
      const rooms = grouped.get(team.name) ?? new Map<string, Set<number>>();
      const mates: Teammate[] = Array.from(rooms.entries())
        .map(([room, set]) => ({ room, numbers: Array.from(set).sort((a, b) => a - b) }))
        .sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));
      return { team, mates };
    });
  }, [biddings, teams, myRoom]);

  const picks = new Set(myPicks);
  const clashes = data.reduce(
    (n, { team, mates }) => n + (team.shareable ? 0 : mates.filter(m => m.numbers.some(x => picks.has(x))).length),
    0,
  );
  const biddingMates = data.reduce((n, d) => n + d.mates.length, 0);

  if (teams.length === 0) return null;

  return (
    <section className="surface-card overflow-hidden" aria-labelledby="team-bids-heading">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="team-bids-body"
        className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua sm:px-6"
      >
        <Users className="h-[18px] w-[18px] shrink-0 text-silver" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="team-bids-heading" className="text-[17px] font-medium tracking-heading text-heading">
            Your teams
          </h2>
          <p className="text-[13px] leading-snug text-silver">
            {biddingMates === 0
              ? "No teammates have bid yet"
              : `${biddingMates} bidding across ${teams.length} team${teams.length === 1 ? "" : "s"}`}
            {clashes > 0 && (
              <span className="text-warn">
                , {clashes} clash{clashes === 1 ? "es" : ""} with your picks
              </span>
            )}
          </p>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-silver transition-transform duration-200 ease-out", open && "rotate-180")}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open && (
        <div id="team-bids-body" className="animate-fade-up space-y-5 border-t border-hairline px-4 pb-5 pt-4 sm:px-6">
          <p className="text-[12px] text-faint">
            Teammates are shown by room number only. Numbers are what they&apos;re bidding on this round, not in
            choice order.
          </p>
          {data.map(({ team, mates: all }) => {
            // Clashing rows first (no-sharing teams), then by room; cap at 6 unless expanded.
            const isClash = (m: Teammate) => !team.shareable && m.numbers.some(n => picks.has(n));
            const ordered = [...all].sort((a, b) => Number(isClash(b)) - Number(isClash(a)));
            const showAll = !!expanded[team.name];
            const mates = showAll ? ordered : ordered.slice(0, ROW_CAP);
            return (
            <div key={team.name}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-medium text-heading">{teamName(team.name)}</h3>
                {!team.shareable && (
                  <span className="inline-flex h-5 items-center gap-1 rounded-[4px] border border-warn/40 px-1.5 text-[11px] font-medium text-warn">
                    <Lock className="h-3 w-3" strokeWidth={1.75} aria-hidden /> No sharing
                  </span>
                )}
                <span className="text-[12px] tabular-nums text-faint">{all.length} bidding</span>
              </div>
              {mates.length === 0 ? (
                <p className="rounded-xl bg-recessed px-3 py-2.5 text-[13px] text-silver">No teammates have bid yet.</p>
              ) : (
                <ul className="rounded-xl bg-recessed">
                  {mates.map(m => {
                    const clash = !team.shareable && m.numbers.some(n => picks.has(n));
                    return (
                      <li
                        key={m.room}
                        className="flex flex-col gap-1.5 border-b border-hairline px-3 py-2.5 last:border-0 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <span className="shrink-0 text-[13px] tabular-nums text-mist sm:w-32">Room {m.room}</span>
                        <div className="flex min-w-0 flex-wrap items-center gap-1" aria-label="Bidding on">
                          <span className="mr-1 text-[12px] text-faint">bidding on</span>
                          {m.numbers.map(n => {
                            const hit = !team.shareable && picks.has(n);
                            return (
                              <span
                                key={n}
                                title={hit ? `You also picked ${n}. Only one of you can get it.` : undefined}
                                className={cn(
                                  "inline-flex h-7 min-w-[2rem] items-center justify-center rounded-md px-1.5 text-[13px] font-medium tabular-nums",
                                  hit
                                    ? "border border-warn/50 bg-warn/10 text-warn"
                                    : picks.has(n)
                                      ? "bg-pick text-on-pick"
                                      : "bg-raised text-mist outline outline-1 -outline-offset-1 outline-ink/10",
                                )}
                              >
                                {n}
                              </span>
                            );
                          })}
                        </div>
                        {clash && (
                          <p className="text-[12px] text-warn sm:ml-auto sm:text-right">Clashes with your picks</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {all.length > ROW_CAP && (
                <button
                  type="button"
                  onClick={() => setExpanded(e => ({ ...e, [team.name]: !showAll }))}
                  className="mt-1.5 inline-flex h-10 items-center rounded-md px-1 text-[13px] font-medium text-aqua underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
                >
                  {showAll ? "Show fewer" : `Show all ${all.length}`}
                </button>
              )}
            </div>
            );
          })}
          {clashes > 0 && (
            <p className="text-[12px] text-silver">
              <span className="text-warn">Amber</span> numbers are on your list too. On a no-sharing team only one of
              you can get each of them.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
