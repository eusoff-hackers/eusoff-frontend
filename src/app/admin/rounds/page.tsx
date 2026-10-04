"use client";

import React, { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Info } from "lucide-react";
import Link from "next/link";

import { adminApi, useAdminMutation, useRounds } from "@/src/app/admin/api";
import {
  Callout,
  EmptyState,
  ErrorState,
  GenderTag,
  LoadingBlock,
  NumberChip,
  PageHeader,
} from "@/src/app/admin/components/ui";
import LeftoversPanel from "@/src/app/admin/rounds/LeftoversPanel";
import type { AllocationPreview, Round } from "@/src/app/admin/types";
import { StatusPill } from "@/src/app/components/RoundTimeline";
import { formatCountdown, formatSgt, fromSgtInput, toSgtInput, useNow } from "@/src/app/lib/time";

type Draft = Record<number, { open: string; close: string }>;

const ordinal = (n: number) => ["1st", "2nd", "3rd", "4th", "5th"][n] ?? `${n + 1}th`;

function PersonLine({ name, meta }: { name: string; meta: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm text-white">{name}</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs tabular-nums text-silver">{meta}</p>
    </div>
  );
}

function PreviewDialog({
  round,
  preview,
  onClose,
}: {
  round: number | null;
  preview: AllocationPreview | null;
  onClose: () => void;
}) {
  const results = preview ? [...preview.results].sort((a, b) => a.number - b.number) : [];
  return (
    <Dialog open={round != null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex max-w-3xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Allocation preview, round {round}</DialogTitle>
          <DialogDescription>A dry run with the bids as they stand right now. Nothing is saved.</DialogDescription>
        </DialogHeader>
        {!preview ? (
          <LoadingBlock rows={5} />
        ) : (
          <div className="min-h-0 flex-1 space-y-5">
            <section>
              <h3 className="mb-2 text-[13px] text-silver">
                Would be allocated <span className="tabular-nums text-mist">{results.length}</span>
              </h3>
              {results.length === 0 ? (
                <EmptyState>Nobody would be allocated.</EmptyState>
              ) : (
                <ul className="rounded-xl bg-recessed">
                  {results.map(r => (
                    <li key={r.user._id} className="flex items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-0">
                      <NumberChip n={r.number} highlight />
                      <PersonLine
                        name={r.user.name}
                        meta={
                          <>
                            <span>{r.user.room}</span>
                            <GenderTag gender={r.user.gender} />
                            <span>{r.user.points} pts</span>
                            <span>Y{r.user.year}</span>
                          </>
                        }
                      />
                      <span
                        className={cn(
                          "shrink-0 rounded-[5px] px-2 py-1 text-[11px] font-medium",
                          r.choice === 0 ? "bg-aqua/10 text-aqua" : "bg-white/[0.06] text-silver",
                        )}
                      >
                        {ordinal(r.choice)} choice
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h3 className="mb-2 text-[13px] text-silver">
                Would miss out <span className="tabular-nums text-mist">{preview.unallocated.length}</span>
              </h3>
              {preview.unallocated.length === 0 ? (
                <EmptyState>Every bidder gets a number.</EmptyState>
              ) : (
                <ul className="rounded-xl border border-warn/25 bg-recessed">
                  {preview.unallocated.map(u => (
                    <li key={u.user._id} className="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2.5 last:border-0">
                      <PersonLine
                        name={u.user.name}
                        meta={
                          <>
                            <span>{u.user.room}</span>
                            <GenderTag gender={u.user.gender} />
                            <span>{u.user.points} pts</span>
                          </>
                        }
                      />
                      <div className="flex flex-wrap gap-1" aria-label="Choices">
                        {u.choices.map((n, i) => (
                          <NumberChip key={`${n}-${i}`} n={n} className="h-7 min-w-[2rem] text-xs" />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoundCard({
  round,
  draft,
  now,
  onDraft,
  onPreview,
  onAllocate,
  onUndo,
  busy,
}: {
  round: Round;
  draft: { open: string; close: string };
  now: number;
  onDraft: (field: "open" | "close", value: string) => void;
  onPreview: () => void;
  onAllocate: () => void;
  onUndo: () => void;
  busy: boolean;
}) {
  const locked = round.status === "allocated" || round.status === "allocating";
  const openMs = fromSgtInput(draft.open);
  const closeMs = fromSgtInput(draft.close);
  const invalid = !Number.isNaN(openMs) && !Number.isNaN(closeMs) && closeMs <= openMs;
  const countdown =
    round.status === "scheduled" && round.open > now
      ? `Opens in ${formatCountdown(round.open - now)}`
      : round.status === "open" && round.close > now
        ? `Closes in ${formatCountdown(round.close - now)}`
        : null;

  return (
    <article className={cn("surface-card min-w-0 p-4 sm:p-6", round.status === "open" && "border-aqua/25")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-medium tracking-heading text-white">Round {round.round}</h2>
        <StatusPill status={round.status} />
      </div>
      <p className="mt-1 h-5 text-sm tabular-nums text-aqua">{countdown}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor={`open-${round.round}`}>Opens (SGT)</Label>
          <Input
            id={`open-${round.round}`}
            type="datetime-local"
            value={draft.open}
            disabled={locked}
            onChange={e => onDraft("open", e.target.value)}
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor={`close-${round.round}`}>Closes (SGT)</Label>
          <Input
            id={`close-${round.round}`}
            type="datetime-local"
            value={draft.close}
            disabled={locked}
            onChange={e => onDraft("close", e.target.value)}
            aria-invalid={invalid}
          />
        </div>
      </div>
      {invalid && <p className="mt-2 text-sm text-danger">Close must be after open.</p>}
      {locked && <p className="mt-2 text-xs text-[#93a19f]">Times are locked once a round is allocated.</p>}

      {round.summary && (
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-recessed p-3">
          {[
            ["Bidders", round.summary.bidders],
            ["Allocated", round.summary.allocated],
            ["Missed out", round.summary.unallocatedBidders],
          ].map(([l, v]) => (
            <div key={l}>
              <dt className="text-xs text-silver">{l}</dt>
              <dd className="mt-1 text-xl font-medium tabular-nums text-white">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {round.allocatedAt && <p className="mt-2 text-xs text-[#93a19f]">Allocated {formatSgt(round.allocatedAt)}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview} disabled={busy}>
          Preview allocation
        </Button>
        {round.status === "allocated" ? (
          <Button variant="destructive" size="sm" onClick={onUndo} disabled={busy}>
            Undo allocation
          </Button>
        ) : (
          <Button size="sm" onClick={onAllocate} disabled={busy || round.status !== "closed"}>
            Allocate now
          </Button>
        )}
        {round.status !== "scheduled" && (
          <Link
            href={`/admin/rounds/${round.round}/non-bidders`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "sm:ml-auto")}
          >
            Non-bidders <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </div>
      {(round.status === "scheduled" || round.status === "open") && (
        <p className="mt-2 text-xs text-[#93a19f]">Allocate now unlocks once the round has closed.</p>
      )}
      {round.status === "allocating" && <p className="mt-2 text-xs text-warn">Allocation is running.</p>}
    </article>
  );
}

export default function RoundsPage() {
  const { data: rounds, error, isLoading, refetch } = useRounds();
  const now = useNow();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [previewRound, setPreviewRound] = useState<number | null>(null);
  const [preview, setPreview] = useState<AllocationPreview | null>(null);
  const [undoRound, setUndoRound] = useState<number | null>(null);

  const serverDraft = (r: Round) => ({ open: toSgtInput(r.open), close: toSgtInput(r.close) });
  const draftFor = (r: Round) => draft?.[r.round] ?? serverDraft(r);

  const changed = (rounds ?? []).filter(r => {
    const d = draftFor(r);
    const s = serverDraft(r);
    return d.open !== s.open || d.close !== s.close;
  });
  const invalid = changed.some(r => {
    const d = draftFor(r);
    const o = fromSgtInput(d.open);
    const c = fromSgtInput(d.close);
    return Number.isNaN(o) || Number.isNaN(c) || c <= o;
  });

  const save = useAdminMutation(adminApi.putRounds, { success: "Round times saved", onData: () => setDraft(null) });
  const runPreview = useAdminMutation(adminApi.preview, { onData: d => setPreview(d) });
  const allocate = useAdminMutation(adminApi.allocateRound, { success: r => `Round ${r.round} allocated` });
  const undo = useAdminMutation(adminApi.undoRound, {
    success: r => `Round ${r.round} allocation undone`,
    onData: () => setUndoRound(null),
  });

  const onDraft = (r: Round, field: "open" | "close", value: string) =>
    setDraft(prev => ({ ...(prev ?? {}), [r.round]: { ...draftFor(r), [field]: value } }));

  const busy = allocate.isPending || undo.isPending || runPreview.isPending;
  const sorted = [...(rounds ?? [])].sort((a, b) => a.round - b.round);

  return (
    <>
      <PageHeader
        title="Rounds"
        description="All times are Singapore time, whatever timezone this device is in."
        actions={
          <>
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Discard
              </Button>
            )}
            <Button
              variant={changed.length > 0 ? "cta" : "default"}
              disabled={changed.length === 0 || invalid || save.isPending}
              onClick={() =>
                save.mutate(
                  changed.map(r => {
                    const d = draftFor(r);
                    return { round: r.round, open: fromSgtInput(d.open), close: fromSgtInput(d.close) };
                  }),
                )
              }
            >
              {save.isPending
                ? "Saving"
                : changed.length > 0
                  ? `Save ${changed.length} change${changed.length === 1 ? "" : "s"}`
                  : "Save times"}
            </Button>
          </>
        }
      />

      <Callout icon={Info} className="mb-4">
        Allocation runs <span className="text-white">automatically</span> when a round closes: by choice rank, then
        points, seniority, then random. Preview shows the likely outcome at any time. Allocate now is only needed if
        the automatic run didn&apos;t happen; Undo releases a round&apos;s numbers so it can run again.
      </Callout>

      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map(r => (
            <RoundCard
              key={r.round}
              round={r}
              draft={draftFor(r)}
              now={now}
              busy={busy}
              onDraft={(f, v) => onDraft(r, f, v)}
              onPreview={() => {
                setPreview(null);
                setPreviewRound(r.round);
                runPreview.mutate(r.round, { onError: () => setPreviewRound(null) });
              }}
              onAllocate={() => allocate.mutate(r.round)}
              onUndo={() => setUndoRound(r.round)}
            />
          ))}
        </div>
      )}

      {rounds && <LeftoversPanel rounds={sorted} />}

      <PreviewDialog
        round={previewRound}
        preview={preview}
        onClose={() => {
          setPreviewRound(null);
          setPreview(null);
        }}
      />

      <Dialog open={undoRound != null} onOpenChange={open => !open && setUndoRound(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo round {undoRound} allocation?</DialogTitle>
            <DialogDescription>
              Every number allocated in round {undoRound} is released and the round goes back to closed. Residents see
              themselves as unallocated until you allocate again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUndoRound(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={undo.isPending}
              onClick={() => undoRound != null && undo.mutate(undoRound)}
            >
              {undo.isPending ? "Undoing" : "Undo allocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
