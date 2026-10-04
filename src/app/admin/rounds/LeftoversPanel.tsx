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
import { AlertTriangle, Shuffle } from "lucide-react";

import { adminApi, useAdminMutation } from "@/src/app/admin/api";
import { Callout, EmptyState, GenderTag, NumberChip, Panel, Segmented } from "@/src/app/admin/components/ui";
import type { AssignPreview, AssignResult, Round } from "@/src/app/admin/types";

/** Default: the latest round that has been allocated. */
function defaultUpTo(rounds: Round[]): number {
  const allocated = rounds.filter(r => r.status === "allocated").map(r => r.round);
  return allocated.length ? Math.max(...allocated) : 1;
}

const impossibleCount = (r: AssignResult["impossible"]) => (Array.isArray(r) ? r.length : r);

/**
 * Leftovers: after rounds are allocated, give everyone still without a number a random,
 * rule-respecting one. Preview first; "Assign all" commits exactly that plan after a confirm dialog.
 */
export default function LeftoversPanel({ rounds }: { rounds: Round[] }) {
  const [upTo, setUpTo] = useState<number>(() => defaultUpTo(rounds));
  const [plan, setPlan] = useState<{ upTo: number; data: AssignPreview } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const preview = useAdminMutation(adminApi.assignPreview, { onData: (data, vars) => setPlan({ upTo: vars ?? upTo, data }) });
  const commit = useAdminMutation(adminApi.assignRemaining, {
    success: r =>
      `Assigned ${r.assigned} number${r.assigned === 1 ? "" : "s"}` +
      (impossibleCount(r.impossible) ? `, ${impossibleCount(r.impossible)} couldn't be placed` : ""),
    onData: () => {
      setConfirming(false);
      setPlan(null);
    },
  });

  const stale = plan && plan.upTo !== upTo;
  const results = plan ? [...plan.data.results].sort((a, b) => a.user.round - b.user.round || b.user.points - a.user.points) : [];

  return (
    <Panel
      className="mt-4"
      title="Leftovers"
      description="Give every resident still without a number a random one that respects quotas, 0 to 9 sharing and team rules. Ranked by points, then seniority."
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <p className="text-[13px] text-silver">Residents from rounds 1 to</p>
          <Segmented
            label="Up to round"
            value={upTo}
            onChange={setUpTo}
            options={[1, 2, 3, 4].map(r => ({ value: r, label: `R${r}` }))}
          />
        </div>
        <Button variant="outline" onClick={() => preview.mutate(upTo)} disabled={preview.isPending}>
          <Shuffle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          {preview.isPending ? "Planning" : plan ? "Preview again" : "Preview auto-assign"}
        </Button>
      </div>

      {plan && (
        <div className="mt-5 space-y-4">
          {stale && (
            <Callout tone="warn" icon={AlertTriangle}>
              This plan is for rounds 1 to {plan.upTo}. Preview again to plan for round {upTo}.
            </Callout>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-silver">
              <span className="text-2xl font-medium tabular-nums text-lavender">{plan.data.results.length}</span>{" "}
              residents would get a number
              {plan.data.impossible.length > 0 && (
                <>
                  , <span className="tabular-nums text-warn">{plan.data.impossible.length}</span> can&apos;t be placed
                </>
              )}
              .
            </p>
            <Button
              disabled={plan.data.results.length === 0 || !!stale || commit.isPending}
              onClick={() => setConfirming(true)}
            >
              Assign all {plan.data.results.length}
            </Button>
          </div>

          {results.length === 0 ? (
            <EmptyState>Everyone up to round {plan.upTo} already has a number.</EmptyState>
          ) : (
            <div className="max-h-[26rem] overflow-auto rounded-xl bg-recessed">
              <table className="w-full min-w-[520px] text-sm tabular-nums">
                <thead className="sticky top-0 bg-recessed">
                  <tr className="border-b border-hairline text-left [&>th]:h-10 [&>th]:px-3 [&>th]:text-[11px] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.12em] [&>th]:text-silver">
                    <th className="!pl-4">Number</th>
                    <th>Resident</th>
                    <th>Room</th>
                    <th>Gender</th>
                    <th>Round</th>
                    <th className="!pr-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.user._id} className="border-b border-hairline last:border-0">
                      <td className="py-2 pl-4 pr-3">
                        <NumberChip n={r.number} highlight />
                      </td>
                      <td className="max-w-[14rem] truncate px-3 py-2 text-white">{r.user.name}</td>
                      <td className="px-3 py-2 text-silver">{r.user.room}</td>
                      <td className="px-3 py-2">
                        <GenderTag gender={r.user.gender} />
                      </td>
                      <td className="px-3 py-2 text-silver">{r.user.round}</td>
                      <td className="py-2 pl-3 pr-4 text-right text-mist">{r.user.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {plan.data.impossible.length > 0 && (
            <div>
              <h3 className="mb-2 text-[13px] text-silver">Can&apos;t be placed</h3>
              <ul className="rounded-xl border border-warn/25 bg-recessed">
                {plan.data.impossible.map(i => (
                  <li
                    key={i.user._id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-2.5 text-sm last:border-0"
                  >
                    <span className="min-w-0 truncate text-white">
                      {i.user.name} <span className="text-silver">{i.user.room}</span>
                    </span>
                    <span className="text-warn">{i.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {plan?.data.results.length} numbers?</DialogTitle>
            <DialogDescription>
              Every resident in the preview gets the number shown, for rounds 1 to {plan?.upTo}. You can still change
              or remove a number from a resident&apos;s page afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="cta" disabled={commit.isPending || !plan} onClick={() => plan && commit.mutate(plan.upTo)}>
              {commit.isPending ? "Assigning" : `Assign all ${plan?.data.results.length ?? ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
