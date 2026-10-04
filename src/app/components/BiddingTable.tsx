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
import TeamBids from "@/src/app/dashboard/jersey/TeamBids";
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

  /**
   * While bidding, "available" is the server's eligibility list. Before/after the user's window the
   * eligibility list is empty, so the grid becomes a read-only preview of which numbers still have
   * quota for this resident's gender.
   */
  const preview = !canBid;
  const isOpenNumber = (n: number) => (preview ? (quotaFor(n) ?? 0) > 0 : eligible.has(n));
  const allNumbers = Array.from({ length: 100 }, (_, i) => i);
  const availableCount = allNumbers.filter(n => isOpenNumber(n) || rankOf.has(n)).length;
  const gridNumbers = allNumbers.filter(n => view === "all" || isOpenNumber(n) || rankOf.has(n));
  const emptySlots = MAX_BIDS - currentBids.length;

  return (
    <div className="space-y-4">
      {/* Choices: filled rows carry the controls; empty slots collapse into one compact strip. */}
      <section className="surface-card p-4 sm:p-6" aria-labelledby="choices-heading">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="choices-heading" className="text-[17px] font-medium tracking-heading text-heading">
            Your choices
          </h2>
          <span className="text-sm tabular-nums text-silver">
            <span className="font-medium text-heading">{currentBids.length}</span> of {MAX_BIDS}
          </span>
        </div>

        {currentBids.length > 0 && (
          <ol className="mt-4 space-y-2">
            {currentBids.map((bid, index) => {
              const demand = demandFor(bid.number);
              const quota = quotaFor(bid.number);
              const contested = quota != null && demand >= Math.max(1, quota);
              return (
                <li
                  key={bid.number}
                  className="flex min-w-0 animate-fade-up items-center gap-2 rounded-xl bg-recessed py-2 pl-3 pr-1 sm:gap-4 sm:py-1.5 sm:pl-4"
                >
                  <span className="w-7 shrink-0 text-[12px] tabular-nums text-faint">{ORDINAL[index]}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                    <span className="text-[1.625rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-lavender sm:w-12">
                      {bid.number}
                    </span>
                    <span className={cn("truncate text-[12px] sm:text-[13px]", contested ? "text-warn" : "text-faint")}>
                      {demand === 0
                        ? "No one else yet"
                        : `${demand} other${demand === 1 ? "" : "s"}${quota != null ? `, ${quota} slot${quota === 1 ? "" : "s"}` : ""}`}
                    </span>
                  </div>
                  {canBid && (
                    <div className="flex shrink-0 items-center">
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
        )}

        {emptySlots > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <ol className="flex gap-1.5" aria-label={`${emptySlots} empty choice slots`}>
              {Array.from({ length: emptySlots }, (_, i) => (
                <li
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-ink/20 text-[11px] tabular-nums text-faint"
                >
                  {currentBids.length + i + 1}
                </li>
              ))}
            </ol>
            <p className="min-w-0 text-[13px] text-silver">
              {canBid
                ? currentBids.length === 0
                  ? "Tap a number below to add your 1st choice."
                  : `${emptySlots} left. Extra choices only improve your chances.`
                : currentBids.length === 0
                  ? "You'll pick up to five when your round opens."
                  : "Bidding is closed for you."}
            </p>
          </div>
        )}
        {saving && (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-silver" aria-live="polite">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving your choices
          </p>
        )}
      </section>

      {/* Teammates' bids (rules: visible per team, by room only). Sits between your picks and the grid. */}
      <TeamBids
        teams={userBids.info.teams.map(t => t.team)}
        biddings={biddings}
        myRoom={user.room}
        myPicks={numbers}
      />

      {/* Number grid */}
      <section id={gridId} className="surface-card scroll-mt-20 p-4 sm:p-6" aria-labelledby="numbers-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="numbers-heading" className="text-[17px] font-medium tracking-heading text-heading">
              {preview ? "Numbers still free" : "Pick a number"}
            </h2>
            <p className="mt-0.5 text-[13px] text-silver">
              {preview
                ? `${availableCount} of 100 have a ${myGender ?? ""} slot left. Preview only.`
                : `${availableCount} you can bid on. Tap one for who else wants it.`}
            </p>
          </div>
          <Segmented
            label="Show numbers"
            value={view}
            onChange={setView}
            options={[
              { value: "all", label: "All" },
              { value: "available", label: preview ? "Free" : "Available", count: availableCount },
            ]}
          />
        </div>

        {/* Sticky picks bar keeps your choices in view while scrolling the grid (bidding only). */}
        {canBid && (
          <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 mt-3 border-y border-hairline bg-raised/95 px-4 py-2 backdrop-blur sm:top-16 sm:-mx-6 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-faint">Picks</span>
              <ol className="flex gap-1">
                {Array.from({ length: MAX_BIDS }, (_, i) => {
                  const n = currentBids[i]?.number;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1 text-[13px] font-medium tabular-nums",
                        n != null ? "bg-lavender-fill text-on-accent" : "border border-dashed border-ink/20 text-faint",
                      )}
                    >
                      {n ?? i + 1}
                    </li>
                  );
                })}
              </ol>
              <span className="ml-auto hidden text-[12px] text-faint sm:inline">
                <span className="text-warn">3</span> = others bidding
              </span>
            </div>
          </div>
        )}

        <ul className="my-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-silver" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-ink/20 bg-raised" aria-hidden />
            {preview ? "Free" : "Available"}
          </li>
          {!preview && (
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] bg-lavender-fill" aria-hidden /> Your choice
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] bg-recessed" aria-hidden /> {preview ? "Taken" : "Not open to you"}
          </li>
          {!preview && (
            <li className="flex items-center gap-1.5 sm:hidden">
              <span className="text-[11px] font-medium tabular-nums text-warn">3</span> Others bidding
            </li>
          )}
        </ul>

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {gridNumbers.map(number => {
            const open = isOpenNumber(number);
            const rank = rankOf.get(number);
            const chosen = rank != null;
            const demand = demandFor(number);
            const quota = quotaFor(number);
            const contested = quota != null && demand >= Math.max(1, quota);
            const interactive = preview ? true : open || chosen;
            return (
              <button
                key={number}
                type="button"
                onClick={() => setSelectedNumber(number)}
                disabled={!interactive}
                aria-label={
                  chosen
                    ? `Number ${number}, your ${ORDINAL[rank]} choice`
                    : `Number ${number}${open ? (demand ? `, ${demand} others bidding` : preview ? ", free" : ", available") : preview ? ", taken" : ", unavailable"}`
                }
                className={cn(
                  "relative flex h-11 min-w-0 items-center justify-center rounded-lg text-base font-medium tabular-nums transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua sm:h-12 sm:text-[17px]",
                  chosen
                    ? "bg-lavender-fill text-on-accent hover:brightness-[0.97]"
                    : open
                      ? "border border-ink/[0.14] bg-raised text-mist hover:border-aqua/60 hover:bg-aqua/[0.06] active:scale-[0.96]"
                      : preview
                        ? "bg-recessed text-faint"
                        : "cursor-not-allowed bg-recessed text-low",
                )}
              >
                {number}
                {chosen && (
                  <span className="absolute left-1.5 top-1 text-[10px] font-semibold leading-none text-on-accent/70">
                    {rank + 1}
                  </span>
                )}
                {!chosen && open && demand > 0 && (
                  <span
                    className={cn(
                      "absolute bottom-1 right-1.5 text-[10px] font-medium leading-none tabular-nums",
                      contested ? "text-warn" : "text-faint",
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
        {gridNumbers.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink/20 px-4 py-6 text-center text-sm text-silver">
            No numbers are open to you right now.
          </p>
        )}
        <p className="mt-3 text-[12px] text-faint">
          {preview
            ? "Numbers taken in earlier rounds lose their slots. Bidding opens on your round's date."
            : `Small counts show other ${myGender ?? "resident"} bidders this round. Amber means more bidders than slots.`}
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
                        (bid.points ?? 0) > userBids.info.points ? "text-heading" : "text-silver",
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
                  ? "Opens with your round"
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
