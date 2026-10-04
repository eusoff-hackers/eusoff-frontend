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
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";

import { Segmented } from "@/src/app/components/system";
import type { BiddingData, EligibleBids, UserBid } from "@/src/app/dashboard/jersey/types";
import { api, errorMessage } from "@/src/app/lib/api";
import type { User } from "@/src/app/redux/Resources/userSlice";

const MAX_BIDS = 5;
const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th"];

interface BiddingTableProps {
  user: User;
  userBids: UserBid;
  refetchUserBids: () => Promise<QueryObserverResult<UserBid, Error>>;
  biddings: BiddingData | undefined;
  userEligibleBids: EligibleBids | undefined;
  /** Anchor id for the number grid, so the status card's CTA can scroll to it. */
  gridId?: string;
}

interface BidEntry {
  number: number;
  priority: number;
}

type GenderKey = "male" | "female";
const genderKey = (g: string | undefined): GenderKey | null => (g === "male" || g === "female" ? g : null);

const BiddingTable: React.FC<BiddingTableProps> = ({
  user,
  userBids,
  refetchUserBids,
  biddings,
  userEligibleBids,
  gridId = "numbers",
}) => {
  const { toast } = useToast();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"all" | "available">("all");

  const canBid = userBids.canBid;
  const activeRound = userBids.system.bidRound;
  const myGender = genderKey(user.gender);

  // While bidding, only this round's bids are editable; otherwise show everything on record.
  const currentBids: BidEntry[] = userBids.bids
    .filter(bid => !canBid || bid.round == null || bid.round === activeRound)
    .sort((a, b) => a.priority - b.priority)
    .map(bid => ({ number: bid.jersey.number, priority: bid.priority }));
  const rankOf = new Map(currentBids.map((b, i) => [b.number, i]));
  const eligible = new Set(userEligibleBids?.jerseys ?? []);
  const isFull = currentBids.length >= MAX_BIDS;

  /** Other residents of your gender bidding for a number this round (they compete for the same quota). */
  const demandFor = (n: number) => {
    const b = biddings?.[n];
    if (!b) return 0;
    const count = myGender ? b[myGender].length : b.male.length + b.female.length;
    return Math.max(0, count - (rankOf.has(n) ? 1 : 0));
  };
  const quotaFor = (n: number) => {
    const q = biddings?.[n]?.quota;
    if (!q) return null;
    return myGender ? q[myGender] : q.male + q.female;
  };

  // The server replaces this round's bids and takes priority from array order (index 0 = top choice).
  const submitBids = async (numbers: number[], successTitle: string) => {
    setSaving(true);
    try {
      await api.post("/jersey/bid", { bids: numbers.map(number => ({ number })) });
      await refetchUserBids();
      toast({ variant: "success", title: successTitle });
      return true;
    } catch (err) {
      toast({ variant: "destructive", title: "Your choices weren't saved", description: errorMessage(err) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const numbers = currentBids.map(b => b.number);

  const handlePlaceBid = async (number: number) => {
    const ok = await submitBids([...numbers, number], `Added ${number} as your ${ORDINAL[numbers.length]} choice`);
    if (ok) setSelectedNumber(null);
  };

  const handleDeleteBid = (number: number) =>
    submitBids(
      numbers.filter(n => n !== number),
      `Removed ${number}`,
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
    ? [
        ...selected.male.map(b => ({ ...b, gender: "male" as const })),
        ...selected.female.map(b => ({ ...b, gender: "female" as const })),
      ]
        .filter(b => !myGender || b.gender === myGender)
        .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    : [];
  const alreadyBid = selectedNumber != null && rankOf.has(selectedNumber);
  const selectedQuota = selectedNumber != null ? quotaFor(selectedNumber) : null;
  const ahead = bidders.filter(b => (b.points ?? 0) > userBids.info.points).length;

  const availableCount = Array.from({ length: 100 }, (_, i) => i).filter(n => eligible.has(n) || rankOf.has(n)).length;
  const gridNumbers = Array.from({ length: 100 }, (_, i) => i).filter(
    n => view === "all" || eligible.has(n) || rankOf.has(n),
  );

  return (
    <div className="space-y-4">
      {/* Choices */}
      <section className="surface-card p-4 sm:p-6" aria-labelledby="choices-heading">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 id="choices-heading" className="text-[17px] font-medium tracking-heading text-white">
            Your choices
          </h2>
          <span className="text-sm tabular-nums text-silver">
            <span className="text-mist">{currentBids.length}</span> / {MAX_BIDS}
          </span>
        </div>

        <ol className="grid gap-2 sm:grid-cols-5">
          {Array.from({ length: MAX_BIDS }, (_, index) => {
            const bid = currentBids[index];
            if (!bid) {
              return (
                <li
                  key={`empty-${index}`}
                  className="flex h-16 items-center gap-3 rounded-xl border border-dashed border-white/[0.12] px-4 sm:h-auto sm:min-h-[132px] sm:flex-col sm:items-start sm:justify-between sm:p-4"
                >
                  <span className="text-[13px] text-[#93a19f]">{ORDINAL[index]}</span>
                  <span className="text-[13px] text-[#93a19f]">
                    {canBid && index === currentBids.length ? "Tap a number below" : "Empty"}
                  </span>
                </li>
              );
            }
            const demand = demandFor(bid.number);
            return (
              <li
                key={bid.number}
                className="flex min-w-0 animate-fade-up items-center gap-3 rounded-xl bg-recessed py-2 pl-4 pr-1.5 sm:min-h-[132px] sm:flex-col sm:items-stretch sm:p-4"
              >
                <span className="w-9 shrink-0 text-[13px] text-silver sm:w-auto">{ORDINAL[index]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[2rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-lavender">
                    {bid.number}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#93a19f]">
                    {demand === 0 ? "No one else yet" : `${demand} other${demand === 1 ? "" : "s"} bidding`}
                  </p>
                </div>
                {canBid && (
                  <div className="flex shrink-0 items-center sm:-mx-1.5 sm:-mb-1.5 sm:justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving || index === 0}
                      onClick={() => handleMove(index, -1)}
                      aria-label={`Move ${bid.number} up to ${ORDINAL[index - 1] ?? ""} choice`}
                    >
                      <ChevronUp className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving || index === currentBids.length - 1}
                      onClick={() => handleMove(index, 1)}
                      aria-label={`Move ${bid.number} down to ${ORDINAL[index + 1] ?? ""} choice`}
                    >
                      <ChevronDown className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving}
                      onClick={() => handleDeleteBid(bid.number)}
                      aria-label={`Remove ${bid.number}`}
                      className="hover:bg-danger/10 hover:text-danger"
                    >
                      <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {saving && (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-silver" aria-live="polite">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving your choices
          </p>
        )}
      </section>

      {/* Number grid */}
      <section id={gridId} className="surface-card scroll-mt-20 p-4 sm:p-6" aria-labelledby="numbers-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="numbers-heading" className="text-[17px] font-medium tracking-heading text-white">
            Numbers
          </h2>
          <Segmented
            label="Show numbers"
            value={view}
            onChange={setView}
            options={[
              { value: "all", label: "All", count: 100 },
              { value: "available", label: "Available", count: availableCount },
            ]}
          />
        </div>

        <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-silver" aria-label="Legend">
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[4px] border border-white/15 bg-white/[0.06]" aria-hidden /> Available
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[4px] bg-lavender" aria-hidden /> Your
            choice
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[4px] bg-recessed" aria-hidden /> Taken or not allowed
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[11px] font-medium tabular-nums text-warn" aria-hidden>
              3
            </span>
            Others bidding
          </li>
        </ul>

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
          {gridNumbers.map(number => {
            const isEligible = eligible.has(number);
            const rank = rankOf.get(number);
            const chosen = rank != null;
            const demand = demandFor(number);
            const quota = quotaFor(number);
            const contested = quota != null && demand >= Math.max(1, quota);
            return (
              <button
                key={number}
                type="button"
                onClick={() => setSelectedNumber(number)}
                disabled={!isEligible && !chosen}
                aria-label={
                  chosen
                    ? `Number ${number}, your ${ORDINAL[rank]} choice`
                    : `Number ${number}${isEligible ? (demand ? `, ${demand} others bidding` : ", available") : ", unavailable"}`
                }
                className={cn(
                  "group relative flex h-12 min-w-0 items-center justify-center rounded-md text-[17px] font-medium tabular-nums transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua sm:h-14 sm:text-lg",
                  chosen
                    ? "bg-lavender text-canvas hover:brightness-95"
                    : isEligible
                      ? "border border-white/[0.1] bg-white/[0.04] text-mist hover:border-aqua/50 hover:bg-aqua/[0.06] active:scale-[0.96]"
                      : "cursor-not-allowed bg-recessed text-low",
                )}
              >
                {number}
                {chosen && (
                  <span className="absolute left-1.5 top-1 text-[10px] font-semibold leading-none text-canvas/70">
                    {rank + 1}
                  </span>
                )}
                {!chosen && isEligible && demand > 0 && (
                  <span
                    className={cn(
                      "absolute bottom-1 right-1.5 text-[10px] font-medium leading-none tabular-nums",
                      contested ? "text-warn" : "text-silver/70",
                    )}
                    aria-hidden
                  >
                    {demand}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[13px] text-[#93a19f]">
          Corner counts show other {myGender ?? "resident"} bidders this round. Amber means more bidders than slots.
        </p>
      </section>

      <Dialog open={selectedNumber != null} onOpenChange={open => !open && setSelectedNumber(null)}>
        <DialogContent className="flex max-w-md flex-col">
          <DialogHeader>
            <p className="eyebrow">Number</p>
            <DialogTitle className="!mt-2 text-[4.5rem] leading-none tracking-[-0.04em] tabular-nums text-lavender">
              {selectedNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedQuota != null && (
                <>
                  <span className="tabular-nums text-mist">{selectedQuota}</span> {myGender ?? ""} slot
                  {selectedQuota === 1 ? "" : "s"} left.{" "}
                </>
              )}
              You have <span className="tabular-nums text-mist">{userBids.info.points}</span> points
              {bidders.length > 0 && (
                <>
                  ; <span className="tabular-nums text-mist">{ahead}</span> bidder{ahead === 1 ? " has" : "s have"} more.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0">
            <h3 className="mb-2 text-[13px] font-medium text-silver">
              {myGender ? `Other ${myGender} bidders` : "Other bidders"}{" "}
              <span className="tabular-nums text-mist">{bidders.length}</span>
            </h3>
            {bidders.length === 0 ? (
              <p className="rounded-xl bg-recessed px-4 py-3 text-sm text-silver">No one else has bid on this number.</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto rounded-xl bg-recessed">
                {bidders.map((bid, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5 text-sm last:border-0"
                  >
                    <span className="truncate text-silver">Room {bid.user?.room ?? "unknown"}</span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums",
                        (bid.points ?? 0) > userBids.info.points ? "text-white" : "text-silver",
                      )}
                    >
                      {bid.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            {alreadyBid ? (
              <p className="text-sm text-silver">
                This is your {ORDINAL[rankOf.get(selectedNumber!)!]} choice.
              </p>
            ) : (
              <Button
                variant="cta"
                size="lg"
                className="w-full"
                disabled={!canBid || isFull || saving || selectedNumber == null}
                onClick={() => selectedNumber != null && handlePlaceBid(selectedNumber)}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {!canBid
                  ? "Bidding closed"
                  : isFull
                    ? `You have ${MAX_BIDS} choices`
                    : saving
                      ? "Saving"
                      : `Add as ${ORDINAL[currentBids.length]} choice`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiddingTable;
