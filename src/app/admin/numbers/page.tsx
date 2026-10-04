"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { adminApi, adminKeys, useAdminMutation, useJerseys } from "@/src/app/admin/api";
import { sequential } from "@/src/app/admin/components/charts";
import { ErrorState, GenderTag, PageHeader, Skeleton } from "@/src/app/admin/components/ui";
import type { AdminJersey } from "@/src/app/admin/types";

const describeDefault = (q: AdminJersey["defaultQuota"]) =>
  typeof q === "number" ? `${q} each` : q ? `M ${q.male}, F ${q.female}` : "not set";

/** Single-hue sequential heat (dim to bright teal) proportional to this round's bids on the number. */
const heat = (bids: number, max: number) => (bids > 0 && max > 0 ? 0.15 + 0.85 * (bids / max) : 0);

function JerseyDialog({ jersey, onClose }: { jersey: AdminJersey | null; onClose: () => void }) {
  return (
    <Dialog open={jersey != null} onOpenChange={open => !open && onClose()}>
      <DialogContent>
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
      <DialogHeader>
        <p className="eyebrow">Number</p>
        <DialogTitle className="!mt-2 text-[4rem] leading-none tracking-[-0.04em] tabular-nums text-lavender">
          {jersey.number}
        </DialogTitle>
        <DialogDescription>
          This round: <span className="tabular-nums text-mist">{jersey.bids.male}</span> male and{" "}
          <span className="tabular-nums text-mist">{jersey.bids.female}</span> female bids
        </DialogDescription>
      </DialogHeader>

      <section>
        <h3 className="mb-2 text-[13px] text-silver">
          Holders <span className="tabular-nums text-mist">{jersey.holders.length}</span>
        </h3>
        {jersey.holders.length === 0 ? (
          <p className="rounded-xl bg-recessed px-4 py-3 text-sm text-silver">Nobody holds this number yet.</p>
        ) : (
          <ul className="rounded-xl bg-recessed">
            {jersey.holders.map((h, i) => (
              <li key={`${h.name}-${i}`} className="flex items-center gap-2 border-b border-hairline px-3 py-2.5 text-sm last:border-0">
                <GenderTag gender={h.gender} />
                <span className="min-w-0 flex-1 truncate text-white">{h.name}</span>
                <span className="text-silver">{h.room}</span>
                <span className="text-xs text-[#93a19f]">R{h.round}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] text-silver">Unavailable to teams</h3>
        {jersey.bannedTeams.length === 0 ? (
          <p className="text-sm text-[#93a19f]">No non-shareable team holds this number.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {jersey.bannedTeams.map(t => (
              <span key={t} className="inline-flex h-7 items-center rounded-md border border-warn/30 px-2.5 text-xs text-warn">
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      <form
        className="space-y-3 rounded-xl bg-recessed p-4"
        onSubmit={e => {
          e.preventDefault();
          if (valid && dirty) save.mutate({ number: jersey.number, quota: { male: m, female: f } });
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium text-white">Remaining quota</h3>
          <span className="text-xs text-silver">Default {describeDefault(jersey.defaultQuota)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="q-male">Male</Label>
            <Input
              id="q-male"
              type="number"
              inputMode="numeric"
              min={0}
              value={male}
              onChange={e => setMale(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-female">Female</Label>
            <Input
              id="q-female"
              type="number"
              inputMode="numeric"
              min={0}
              value={female}
              onChange={e => setFemale(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={!valid || !dirty || save.isPending}>
          {save.isPending ? "Saving" : "Save quota"}
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
      <PageHeader title="Numbers" description="Tap a number for its holders, team restrictions, bids and quota." />

      <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-silver" aria-label="Legend">
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-10 rounded-[3px]"
            style={{ background: `linear-gradient(90deg, ${sequential(0.15)}, ${sequential(1)})` }}
            aria-hidden
          />
          Bids this round
        </li>
        <li>
          <span className="tabular-nums text-mist">1/1</span> remaining quota, male/female
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-[4px] bg-lavender px-1 text-[10px] font-medium text-canvas">
            2
          </span>
          Holders
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-[4px] border border-dashed border-white/25 bg-recessed" aria-hidden />
          No quota left
        </li>
      </ul>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 100 }, (_, i) => (
            <Skeleton key={i} className="aspect-square min-h-[48px]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
          {sorted.map(j => {
            const bids = j.bids.male + j.bids.female;
            const full = j.quota.male <= 0 && j.quota.female <= 0;
            const h = full ? 0 : heat(bids, maxBids);
            // switch to dark ink once the fill is light enough that white text would drop below AA
            const hot = h > 0.32;
            return (
              <button
                key={j.number}
                type="button"
                onClick={() => setSelected(j.number)}
                style={h ? { backgroundColor: sequential(h) } : undefined}
                aria-label={`Number ${j.number}: ${j.quota.male} male and ${j.quota.female} female quota left, ${j.holders.length} holders, ${bids} bids`}
                className={cn(
                  "relative flex aspect-square min-h-[48px] min-w-0 flex-col items-center justify-center rounded-md p-0.5 transition-[transform,outline-color] duration-150 hover:outline hover:outline-1 hover:outline-aqua/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua active:scale-[0.96]",
                  full
                    ? "border border-dashed border-white/20 bg-recessed text-silver"
                    : h
                      ? hot
                        ? "text-canvas"
                        : "text-white"
                      : "border border-white/[0.08] bg-white/[0.03] text-mist",
                )}
              >
                {j.holders.length > 0 && (
                  <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-[4px] bg-lavender px-1 text-[10px] font-medium tabular-nums text-canvas">
                    {j.holders.length}
                  </span>
                )}
                <span className="text-lg font-medium tabular-nums leading-none sm:text-xl">{j.number}</span>
                <span className={cn("mt-1 text-[10px] tabular-nums leading-none", hot ? "text-canvas/75" : "text-silver")}>
                  {j.quota.male}/{j.quota.female}
                </span>
                {bids > 0 && (
                  <span
                    className={cn(
                      "mt-0.5 hidden text-[10px] tabular-nums leading-none sm:block",
                      hot ? "text-canvas/75" : "text-silver",
                    )}
                  >
                    {bids} bid{bids === 1 ? "" : "s"}
                  </span>
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
