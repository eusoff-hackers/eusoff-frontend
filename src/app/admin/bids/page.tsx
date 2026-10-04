"use client";

import React, { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useRoundBids, useRounds } from "@/src/app/admin/api";
import { EmptyState, ErrorState, GenderTag, LoadingBlock, NumberChip, PageHeader } from "@/src/app/admin/components/ui";
import type { Round } from "@/src/app/admin/types";

/** The round an admin most likely wants: the open one, else the latest that has started. */
function defaultRound(rounds: Round[] | undefined): number {
  if (!rounds?.length) return 1;
  const open = rounds.find(r => r.status === "open");
  if (open) return open.round;
  const started = rounds.filter(r => r.status !== "scheduled").sort((a, b) => b.round - a.round);
  return started[0]?.round ?? 1;
}

export default function BidsPage() {
  const { data: rounds } = useRounds();
  const [picked, setPicked] = useState<number | null>(null);
  const round = picked ?? defaultRound(rounds);
  const { data, error, isLoading, refetch } = useRoundBids(round);
  const [numberFilter, setNumberFilter] = useState("");

  const filterNum = numberFilter.trim() === "" ? null : Number(numberFilter);
  const list = useMemo(() => {
    const rows = (data ?? []).map(row => ({ ...row, bids: [...row.bids].sort((a, b) => a.priority - b.priority) }));
    const filtered = filterNum == null ? rows : rows.filter(row => row.bids.some(b => b.number === filterNum));
    return filtered.sort((a, b) => b.user.points - a.user.points || b.user.year - a.user.year);
  }, [data, filterNum]);

  return (
    <>
      <PageHeader
        title="Bids"
        description={data ? `${list.length} bidder${list.length === 1 ? "" : "s"} in round ${round}` : undefined}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm sm:flex-row sm:items-end sm:p-4">
        <fieldset>
          <legend className="mb-1 text-xs font-medium text-muted-foreground">Round</legend>
          <div className="inline-flex rounded-md border bg-slate-50 p-0.5" role="radiogroup">
            {[1, 2, 3, 4].map(r => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={round === r}
                onClick={() => setPicked(r)}
                className={cn(
                  "h-10 min-w-[48px] rounded px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  round === r ? "bg-emerald-950 text-white shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                R{r}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="sm:w-48">
          <Label htmlFor="bid-number" className="text-xs text-muted-foreground">
            Filter by number
          </Label>
          <Input
            id="bid-number"
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            placeholder="Any"
            value={numberFilter}
            onChange={e => setNumberFilter(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingBlock rows={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <EmptyState>
          {filterNum != null ? `Nobody bid for #${filterNum} in round ${round}.` : `No bids in round ${round} yet.`}
        </EmptyState>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border bg-card shadow-sm">
          {list.map(row => (
            <li key={row.user._id} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
              <div className="min-w-0 sm:w-64 sm:shrink-0">
                <p className="truncate font-medium">{row.user.name}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{row.user.room}</span>
                  <GenderTag gender={row.user.gender} />
                  <span className="font-semibold text-foreground">{row.user.points} pts</span>
                  <span>Y{row.user.year}</span>
                </p>
              </div>
              <ol className="flex flex-wrap gap-1.5" aria-label="Choices in order">
                {row.bids.map((b, i) => (
                  <li key={`${b.number}-${i}`} className="flex items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    <NumberChip n={b.number} highlight={filterNum === b.number} />
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
