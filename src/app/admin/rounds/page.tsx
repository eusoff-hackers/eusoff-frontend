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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

import { adminApi, useAdminMutation, useRounds } from "@/src/app/admin/api";
import { EmptyState, ErrorState, GenderTag, LoadingBlock, NumberChip, PageHeader } from "@/src/app/admin/components/ui";
import type { AllocationPreview, Round } from "@/src/app/admin/types";
import { StatusPill } from "@/src/app/components/RoundTimeline";
import { formatCountdown, formatSgt, fromSgtInput, toSgtInput, useNow } from "@/src/app/lib/time";

type Draft = Record<number, { open: string; close: string }>;

const ordinal = (n: number) => ["1st", "2nd", "3rd", "4th", "5th"][n] ?? `${n + 1}th`;

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
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-3 rounded-lg p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle>Allocation preview · Round {round}</DialogTitle>
          <DialogDescription>Dry run with the bids as they stand right now. Nothing has been saved.</DialogDescription>
        </DialogHeader>
        {!preview ? (
          <LoadingBlock rows={5} />
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
            <section>
              <h3 className="mb-2 text-sm font-semibold">
                Would be allocated <span className="text-muted-foreground">({results.length})</span>
              </h3>
              {results.length === 0 ? (
                <EmptyState>Nobody would be allocated.</EmptyState>
              ) : (
                <ul className="divide-y rounded-md border">
                  {results.map(r => (
                    <li key={r.user._id} className="flex items-center gap-3 px-3 py-2">
                      <NumberChip n={r.number} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.user.name}</p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span>{r.user.room}</span>
                          <GenderTag gender={r.user.gender} />
                          <span>{r.user.points} pts</span>
                          <span>Y{r.user.year}</span>
                        </p>
                      </div>
                      <span
                        className={
                          r.choice === 0
                            ? "shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900"
                            : "shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {ordinal(r.choice)} choice
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h3 className="mb-2 text-sm font-semibold">
                Unallocated bidders <span className="text-muted-foreground">({preview.unallocated.length})</span>
              </h3>
              {preview.unallocated.length === 0 ? (
                <EmptyState>Every bidder gets a number.</EmptyState>
              ) : (
                <ul className="divide-y rounded-md border border-amber-200">
                  {preview.unallocated.map(u => (
                    <li key={u.user._id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.user.name}</p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span>{u.user.room}</span>
                          <GenderTag gender={u.user.gender} />
                          <span>{u.user.points} pts</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1" aria-label="Choices">
                        {u.choices.map((n, i) => (
                          <NumberChip key={`${n}-${i}`} n={n} className="h-7 text-xs" />
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
    <article className="min-w-0 rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Round {round.round}</h2>
        <StatusPill status={round.status} />
      </div>
      {countdown && <p className="-mt-1 mb-3 text-sm font-medium tabular-nums text-emerald-800">{countdown}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <Label htmlFor={`open-${round.round}`}>Opens (SGT)</Label>
          <Input
            id={`open-${round.round}`}
            type="datetime-local"
            value={draft.open}
            disabled={locked}
            onChange={e => onDraft("open", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="min-w-0">
          <Label htmlFor={`close-${round.round}`}>Closes (SGT)</Label>
          <Input
            id={`close-${round.round}`}
            type="datetime-local"
            value={draft.close}
            disabled={locked}
            onChange={e => onDraft("close", e.target.value)}
            className="mt-1"
            aria-invalid={invalid}
          />
        </div>
      </div>
      {invalid && <p className="mt-1 text-sm text-red-600">Close must be after open.</p>}
      {locked && <p className="mt-2 text-xs text-muted-foreground">Times are locked once a round is allocated.</p>}

      {round.summary && (
        <dl className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-2 text-center">
          <div>
            <dt className="text-[11px] text-muted-foreground">Bidders</dt>
            <dd className="font-semibold tabular-nums">{round.summary.bidders}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Allocated</dt>
            <dd className="font-semibold tabular-nums">{round.summary.allocated}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Missed out</dt>
            <dd className="font-semibold tabular-nums">{round.summary.unallocatedBidders}</dd>
          </div>
        </dl>
      )}
      {round.allocatedAt && (
        <p className="mt-2 text-xs text-muted-foreground">Allocated {formatSgt(round.allocatedAt)}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={onPreview} disabled={busy}>
          Preview allocation
        </Button>
        {round.status === "allocated" ? (
          <Button variant="destructive" onClick={onUndo} disabled={busy}>
            Undo allocation
          </Button>
        ) : (
          <Button onClick={onAllocate} disabled={busy || round.status !== "closed"}>
            Allocate now
          </Button>
        )}
      </div>
      {(round.status === "scheduled" || round.status === "open") && (
        <p className="mt-2 text-xs text-muted-foreground">Allocate now unlocks once the round has closed.</p>
      )}
      {round.status === "allocating" && (
        <p className="mt-2 text-xs font-medium text-amber-800">Allocation is running…</p>
      )}
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
        description="All times are Singapore time (SGT), whatever timezone this device is in."
        actions={
          <>
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Discard
              </Button>
            )}
            <Button
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
              {save.isPending ? "Saving…" : changed.length > 0 ? `Save ${changed.length} change(s)` : "Save times"}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Allocation runs <strong>automatically</strong> when a round closes (by choice rank → points → seniority →
          random). Use <em>Preview</em> to see the likely outcome at any time. <em>Allocate now</em> is only needed if
          the automatic run didn&apos;t happen; <em>Undo</em> reverts a round&apos;s allocations so it can be re-run.
        </p>
      </div>

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

      <PreviewDialog
        round={previewRound}
        preview={preview}
        onClose={() => {
          setPreviewRound(null);
          setPreview(null);
        }}
      />

      <Dialog open={undoRound != null} onOpenChange={open => !open && setUndoRound(null)}>
        <DialogContent className="w-[calc(100%-1rem)] rounded-lg">
          <DialogHeader className="text-left">
            <DialogTitle>Undo round {undoRound} allocation?</DialogTitle>
            <DialogDescription>
              Every number allocated in round {undoRound} will be released and the round goes back to
              &ldquo;closed&rdquo;. Residents will see themselves as unallocated until you allocate again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUndoRound(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={undo.isPending}
              onClick={() => undoRound != null && undo.mutate(undoRound)}
            >
              {undo.isPending ? "Undoing…" : "Undo allocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
