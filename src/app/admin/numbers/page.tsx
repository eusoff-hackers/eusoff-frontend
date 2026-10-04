"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { adminApi, adminKeys, useAdminMutation, useJerseys } from "@/src/app/admin/api";
import { ErrorState, GenderTag, PageHeader, Skeleton } from "@/src/app/admin/components/ui";
import type { AdminJersey } from "@/src/app/admin/types";

const describeDefault = (q: AdminJersey["defaultQuota"]) =>
  typeof q === "number" ? `${q} each` : q ? `M ${q.male} · F ${q.female}` : "—";

/** Amber heat proportional to this round's bids on the number. */
const heatStyle = (bids: number, max: number): React.CSSProperties =>
  bids > 0 && max > 0 ? { backgroundColor: `rgba(245, 158, 11, ${0.12 + 0.68 * (bids / max)})` } : {};

function JerseyDialog({ jersey, onClose }: { jersey: AdminJersey | null; onClose: () => void }) {
  return (
    <Dialog open={jersey != null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto rounded-lg p-4 sm:p-6">
        {jersey && <JerseyDetail key={jersey.number} jersey={jersey} />}
      </DialogContent>
    </Dialog>
  );
}

function JerseyDetail({ jersey }: { jersey: AdminJersey }) {
  const queryClient = useQueryClient();
  const [male, setMale] = useState(String(jersey.quota.male));
  const [female, setFemale] = useState(String(jersey.quota.female));
  const m = Number(male);
  const f = Number(female);
  const valid = male !== "" && female !== "" && Number.isInteger(m) && Number.isInteger(f) && m >= 0 && f >= 0;
  const dirty = m !== jersey.quota.male || f !== jersey.quota.female;

  const save = useAdminMutation(adminApi.patchJersey, {
    success: j => `Quota for #${j.number} updated`,
    onData: j =>
      queryClient.setQueryData<AdminJersey[]>(adminKeys.jerseys, list =>
        list?.map(x => (x.number === j.number ? j : x)),
      ),
  });

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="flex items-center gap-3">
          <span className="inline-flex h-12 w-14 items-center justify-center rounded-md bg-emerald-950 text-2xl font-bold tabular-nums text-amber-200">
            {jersey.number}
          </span>
          Number {jersey.number}
        </DialogTitle>
        <DialogDescription>
          Current-round bids: {jersey.bids.male} male · {jersey.bids.female} female
        </DialogDescription>
      </DialogHeader>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Holders ({jersey.holders.length})</h3>
        {jersey.holders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nobody holds this number yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {jersey.holders.map((h, i) => (
              <li key={`${h.name}-${i}`} className="flex items-center gap-2 px-3 py-2 text-sm">
                <GenderTag gender={h.gender} />
                <span className="min-w-0 flex-1 truncate font-medium">{h.name}</span>
                <span className="text-muted-foreground">{h.room}</span>
                <span className="text-xs text-muted-foreground">R{h.round}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Unavailable to teams</h3>
        {jersey.bannedTeams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No non-shareable team holds this number.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {jersey.bannedTeams.map(t => (
              <span key={t} className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-800">
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      <form
        className="space-y-3 rounded-md border bg-slate-50 p-3"
        onSubmit={e => {
          e.preventDefault();
          if (valid && dirty) save.mutate({ number: jersey.number, quota: { male: m, female: f } });
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">Remaining quota</h3>
          <span className="text-xs text-muted-foreground">Default: {describeDefault(jersey.defaultQuota)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="q-male">Male</Label>
            <Input
              id="q-male"
              type="number"
              inputMode="numeric"
              min={0}
              value={male}
              onChange={e => setMale(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="q-female">Female</Label>
            <Input
              id="q-female"
              type="number"
              inputMode="numeric"
              min={0}
              value={female}
              onChange={e => setFemale(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={!valid || !dirty || save.isPending}>
          {save.isPending ? "Saving…" : "Save quota"}
        </Button>
      </form>
    </>
  );
}

export default function NumbersPage() {
  const { data: jerseys, error, isLoading, refetch } = useJerseys();
  const [selected, setSelected] = useState<number | null>(null);

  const maxBids = Math.max(1, ...(jerseys ?? []).map(j => j.bids.male + j.bids.female));
  const selectedJersey = jerseys?.find(j => j.number === selected) ?? null;
  const sorted = [...(jerseys ?? [])].sort((a, b) => a.number - b.number);

  return (
    <>
      <PageHeader title="Numbers" description="Tap a number for holders, team restrictions, bids and quota." />

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-8 rounded-sm bg-gradient-to-r from-amber-100 to-amber-500" aria-hidden />
          Bids this round
        </span>
        <span>M/F = remaining quota</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-900 px-1 text-[10px] text-white">
            2
          </span>
          holders
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-dashed border-slate-400 bg-slate-100" aria-hidden />
          no quota left
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 100 }, (_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
          {sorted.map(j => {
            const bids = j.bids.male + j.bids.female;
            const full = j.quota.male <= 0 && j.quota.female <= 0;
            return (
              <button
                key={j.number}
                type="button"
                onClick={() => setSelected(j.number)}
                style={heatStyle(bids, maxBids)}
                aria-label={`Number ${j.number}: ${j.quota.male} male and ${j.quota.female} female quota left, ${j.holders.length} holders, ${bids} bids`}
                className={cn(
                  "relative flex aspect-square min-h-[44px] min-w-0 flex-col items-center justify-center rounded-md border bg-card p-0.5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  full && "border-dashed border-slate-400 bg-slate-100 text-slate-500",
                )}
              >
                {j.holders.length > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-900 px-1 text-[10px] font-medium text-white">
                    {j.holders.length}
                  </span>
                )}
                <span className="text-lg font-bold tabular-nums leading-none sm:text-xl">{j.number}</span>
                <span className="mt-1 text-[10px] tabular-nums leading-none text-slate-700">
                  {j.quota.male}/{j.quota.female}
                </span>
                {bids > 0 && (
                  <span className="mt-0.5 hidden text-[10px] leading-none text-amber-950 sm:block">{bids} bids</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <JerseyDialog jersey={selectedJersey} onClose={() => setSelected(null)} />
    </>
  );
}
