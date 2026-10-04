"use client";

import React, { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { useRoundBids, useRounds } from "@/src/app/admin/api";
import {
  EmptyState,
  ErrorState,
  GenderTag,
  LoadingBlock,
  NumberChip,
  PageHeader,
  Segmented,
} from "@/src/app/admin/components/ui";
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
        description={
          data ? (
            <>
              <span className="tabular-nums text-mist">{list.length}</span> bidder{list.length === 1 ? "" : "s"} in
              round {round}, highest points first
            </>
          ) : undefined
        }
        actions={
          <Link href={`/admin/rounds/${round}/non-bidders`} className={buttonVariants({ variant: "outline" })}>
            Who hasn&apos;t bid <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Link>
        }
      />

      <div className="surface-card mb-4 flex flex-col gap-4 p-3 sm:flex-row sm:items-end sm:p-4">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-silver">Round</p>
          <Segmented
            label="Round"
            value={round}
            onChange={setPicked}
            options={[1, 2, 3, 4].map(r => ({ value: r, label: `Round ${r}` }))}
          />
        </div>
        <div className="space-y-1.5 sm:w-48">
          <Label htmlFor="bid-number">Filter by number</Label>
          <Input
            id="bid-number"
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            placeholder="Any"
            value={numberFilter}
            onChange={e => setNumberFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingBlock rows={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <EmptyState>
          {filterNum != null ? `Nobody bid for ${filterNum} in round ${round}.` : `No bids in round ${round} yet.`}
        </EmptyState>
      ) : (
        <ul className="surface-card overflow-hidden">
          {list.map(row => (
            <li
              key={row.user._id}
              className="flex flex-col gap-2.5 border-b border-hairline px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:px-5"
            >
              <div className="min-w-0 sm:w-72 sm:shrink-0">
                <p className="truncate text-[15px] text-heading">{row.user.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs tabular-nums text-silver">
                  <span>{row.user.room}</span>
                  <GenderTag gender={row.user.gender} />
                  <span className="text-mist">{row.user.points} pts</span>
                  <span>Y{row.user.year}</span>
                </p>
              </div>
              <ol className="flex flex-wrap gap-1.5" aria-label="Choices in order">
                {row.bids.map((b, i) => (
                  <li key={`${b.number}-${i}`} className="flex items-center gap-1">
                    <span className="w-2 text-[10px] tabular-nums text-faint">{i + 1}</span>
                    <NumberChip n={b.number} highlight={filterNum === b.number} className={cn(i === 0 && "text-heading")} />
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
