"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { QueryObserverResult } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import type { BiddingData, EligibleBids, UserBid } from "@/src/app/dashboard/jersey/types";
import { api, errorMessage } from "@/src/app/lib/api";
import type { User } from "@/src/app/redux/Resources/userSlice";

const MAX_BIDS = 5;

interface BiddingTableProps {
  user: User;
  userBids: UserBid;
  refetchUserBids: () => Promise<QueryObserverResult<UserBid, Error>>;
  biddings: BiddingData | undefined;
  userEligibleBids: EligibleBids | undefined;
}

interface BidEntry {
  number: number;
  priority: number;
}

// User submit bid form
const BiddingTable: React.FC<BiddingTableProps> = ({ user, userBids, refetchUserBids, biddings, userEligibleBids }) => {
  const { toast } = useToast();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const canBid = userBids.canBid;
  const activeRound = userBids.system.bidRound;

  // While bidding, only this round's bids are editable; otherwise show everything on record.
  const currentBids: BidEntry[] = userBids.bids
    .filter(bid => !canBid || bid.round == null || bid.round === activeRound)
    .sort((a, b) => a.priority - b.priority)
    .map(bid => ({ number: bid.jersey.number, priority: bid.priority }));
  const rankOf = new Map(currentBids.map((b, i) => [b.number, i]));
  const eligible = new Set(userEligibleBids?.jerseys ?? []);
  const isFull = currentBids.length >= MAX_BIDS;

  // The server replaces this round's bids and takes priority from array order (index 0 = top choice).
  const submitBids = async (numbers: number[], successTitle: string) => {
    setSaving(true);
    try {
      await api.post("/jersey/bid", { bids: numbers.map(number => ({ number })) });
      await refetchUserBids();
      toast({ variant: "success", title: successTitle });
      return true;
    } catch (err) {
      toast({ variant: "destructive", title: "Couldn't update your bids", description: errorMessage(err) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const numbers = currentBids.map(b => b.number);

  const handlePlaceBid = async (number: number) => {
    const ok = await submitBids([...numbers, number], `Added #${number} as choice ${numbers.length + 1}`);
    if (ok) setSelectedNumber(null);
  };

  const handleDeleteBid = (number: number) =>
    submitBids(
      numbers.filter(n => n !== number),
      `Removed #${number}`,
    );

  const handleMove = (index: number, delta: -1 | 1) => {
    const next = [...numbers];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    return submitBids(next, "Order updated");
  };

  const selected = selectedNumber != null ? biddings?.[selectedNumber] : undefined;
  const bidders = selected
    ? [...selected.male.map(b => ({ ...b, gender: "M" })), ...selected.female.map(b => ({ ...b, gender: "F" }))].sort(
        (a, b) => (b.points ?? 0) - (a.points ?? 0),
      )
    : [];
  const alreadyBid = selectedNumber != null && rankOf.has(selectedNumber);
  const genderQuota =
    selected &&
    (user.gender === "female" ? selected.quota.female : user.gender === "male" ? selected.quota.male : null);

  return (
    <div className="space-y-4">
      {/* Current bids */}
      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Your choices</h2>
          <span className="text-sm tabular-nums text-muted-foreground">
            {currentBids.length}/{MAX_BIDS}
          </span>
        </div>
        {currentBids.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            {canBid ? "No choices yet — tap an available number below to add it." : "You have no bids on record."}
          </p>
        ) : (
          <ol className="space-y-2">
            {currentBids.map((bid, index) => (
              <li key={bid.number} className="flex items-center gap-3 rounded-lg border bg-slate-50 p-2 pl-3">
                <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground">Choice {index + 1}</span>
                <span className="inline-flex h-10 min-w-[3rem] items-center justify-center rounded-md bg-emerald-950 px-2 text-lg font-bold tabular-nums text-amber-200">
                  {bid.number}
                </span>
                <span className="flex-1" />
                {canBid && (
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving || index === 0}
                      onClick={() => handleMove(index, -1)}
                      aria-label={`Move #${bid.number} up`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving || index === currentBids.length - 1}
                      onClick={() => handleMove(index, 1)}
                      aria-label={`Move #${bid.number} down`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving}
                      onClick={() => handleDeleteBid(bid.number)}
                      aria-label={`Remove #${bid.number}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Number grid */}
      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Numbers</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm border bg-white" aria-hidden /> available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-amber-300" aria-hidden /> your choice
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-slate-200" aria-hidden /> unavailable
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 sm:gap-2 lg:grid-cols-10">
          {Array.from({ length: 100 }, (_, i) => i).map(number => {
            const isEligible = eligible.has(number);
            const rank = rankOf.get(number);
            const chosen = rank != null;
            return (
              <button
                key={number}
                type="button"
                onClick={() => setSelectedNumber(number)}
                disabled={!isEligible && !chosen}
                aria-label={
                  chosen
                    ? `Number ${number}, your choice ${rank + 1}`
                    : `Number ${number}${isEligible ? "" : ", unavailable"}`
                }
                className={cn(
                  "relative flex h-11 min-w-0 items-center justify-center rounded-md border text-base font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 sm:h-12",
                  chosen
                    ? "border-amber-400 bg-amber-300 text-emerald-950"
                    : isEligible
                      ? "bg-white hover:border-emerald-600 hover:bg-emerald-50"
                      : "cursor-not-allowed border-transparent bg-slate-100 text-slate-400",
                )}
              >
                {number}
                {chosen && (
                  <span className="absolute right-0.5 top-0.5 text-[10px] font-bold leading-none text-emerald-900">
                    {rank + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={selectedNumber != null} onOpenChange={open => !open && setSelectedNumber(null)}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-1rem)] max-w-lg flex-col rounded-lg p-4 sm:p-6">
          <DialogHeader className="text-left">
            <DialogTitle>Number {selectedNumber}</DialogTitle>
            <DialogDescription>
              Your points: <span className="font-semibold text-foreground">{userBids.info.points}</span>
              {genderQuota != null && (
                <>
                  {" "}
                  · {genderQuota} {user.gender} slot{genderQuota === 1 ? "" : "s"} left
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="rounded-md bg-slate-50 p-2">
                <p className="text-xs text-muted-foreground">Male quota</p>
                <p className="font-semibold tabular-nums">{selected.quota.male}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <p className="text-xs text-muted-foreground">Female quota</p>
                <p className="font-semibold tabular-nums">{selected.quota.female}</p>
              </div>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <h3 className="mb-2 text-sm font-semibold">Other bidders ({bidders.length})</h3>
            {bidders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bids on this number yet.</p>
            ) : (
              <ul className="divide-y rounded-md border text-sm">
                {bidders.map((bid, index) => (
                  <li key={index} className="flex items-center justify-between px-3 py-2">
                    <span>
                      Room {bid.user?.room ?? "—"} <span className="text-muted-foreground">({bid.gender})</span>
                    </span>
                    <span className="font-medium tabular-nums">{bid.points} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter className="gap-2">
            {alreadyBid ? (
              <p className="text-sm text-muted-foreground">This is your choice {rankOf.get(selectedNumber!)! + 1}.</p>
            ) : (
              <Button
                className="w-full sm:w-auto"
                disabled={!canBid || isFull || saving || selectedNumber == null}
                onClick={() => selectedNumber != null && handlePlaceBid(selectedNumber)}
              >
                {!canBid
                  ? "Bidding closed"
                  : isFull
                    ? `You already have ${MAX_BIDS} choices`
                    : saving
                      ? "Saving…"
                      : `Add as choice ${currentBids.length + 1}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiddingTable;
