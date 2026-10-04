"use client";

import React, { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useNonBidders, useRounds } from "@/src/app/admin/api";
import {
  EmptyState,
  ErrorState,
  GenderTag,
  LoadingBlock,
  NeverBadge,
  PageHeader,
  Segmented,
  Switch,
} from "@/src/app/admin/components/ui";
import { downloadCsv } from "@/src/app/admin/lib/csv";
import type { NonBidder } from "@/src/app/admin/types";
import { StatusPill } from "@/src/app/components/RoundTimeline";
import { formatLastSeen, formatSgt, useNow } from "@/src/app/lib/time";

type View = "all" | "own" | "carry";

function CarryTag() {
  return (
    <span className="inline-flex h-5 items-center whitespace-nowrap rounded-[4px] bg-white/[0.07] px-1.5 text-[11px] font-medium leading-none text-mist">
      Carry-over
    </span>
  );
}

export default function NonBiddersPage() {
  const params = useParams();
  const router = useRouter();
  const round = Math.min(4, Math.max(1, Number(params.round) || 1));
  const { data, error, isLoading, refetch } = useNonBidders(round);
  const { data: rounds } = useRounds();
  const now = useNow(60_000);
  const { toast } = useToast();
  const [view, setView] = useState<View>("all");
  const [neverOnly, setNeverOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = rounds?.find(r => r.round === round);
  const all = useMemo(() => data ?? [], [data]);
  const counts = useMemo(
    () => ({
      all: all.length,
      own: all.filter(n => !n.carryover).length,
      carry: all.filter(n => n.carryover).length,
      never: all.filter(n => n.lastLogin == null).length,
    }),
    [all],
  );
  const list = all.filter(
    n => (view === "all" || (view === "own" ? !n.carryover : n.carryover)) && (!neverOnly || n.lastLogin == null),
  );

  const rows = (items: NonBidder[]) => [
    ["Name", "Matric", "Room", "Gender", "Own round", "Points", "Carry-over", "Last login"],
    ...items.map(n => [
      n.name,
      n.username,
      n.room,
      n.gender ?? "unknown",
      n.round,
      n.points,
      n.carryover ? "yes" : "no",
      n.lastLogin == null ? "never" : formatSgt(n.lastLogin),
    ]),
  ];

  const copyList = async () => {
    const text = list.map(n => `${n.name}\t${n.username}\t${n.room}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ variant: "success", title: `Copied ${list.length} name${list.length === 1 ? "" : "s"}` });
    } catch {
      toast({ variant: "destructive", title: "Couldn't copy", description: "Download the CSV instead." });
    }
  };

  return (
    <>
      <Link
        href="/admin/rounds"
        className="-ml-2 mb-4 inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-[13px] text-silver transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Rounds
      </Link>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            Round {round} {meta && <StatusPill status={meta.status} />}
          </span>
        }
        title="Non-bidders"
        description="Residents expected to bid in this round who placed no bid. Carry-over residents are from earlier rounds and still have no number; bidding is optional for them."
        actions={
          <>
            <Button variant="outline" onClick={copyList} disabled={list.length === 0}>
              {copied ? (
                <Check className="h-4 w-4 text-aqua" strokeWidth={1.5} aria-hidden />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              )}
              Copy list
            </Button>
            <Button
              variant="outline"
              disabled={list.length === 0}
              onClick={() => downloadCsv(`non-bidders-round-${round}.csv`, rows(list))}
            >
              <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden /> CSV
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Round"
          value={round}
          onChange={r => router.push(`/admin/rounds/${r}/non-bidders`)}
          options={[1, 2, 3, 4].map(r => ({ value: r, label: `Round ${r}` }))}
        />
      </div>

      {isLoading ? (
        <LoadingBlock rows={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <dl className="surface-card mb-4 grid grid-cols-3 divide-x divide-hairline">
            {[
              { label: "Own round", value: counts.own, warn: false },
              { label: "Carry-over", value: counts.carry, warn: false },
              { label: "Never logged in", value: counts.never, warn: counts.never > 0 },
            ].map(s => (
              <div key={s.label} className="min-w-0 px-3 py-4 sm:px-6 sm:py-5">
                <dt className="text-[12px] leading-tight text-silver sm:text-[13px]">{s.label}</dt>
                <dd
                  className={cn(
                    "mt-2 text-[1.75rem] font-medium leading-none tracking-[-0.03em] tabular-nums sm:text-[2.25rem]",
                    s.warn ? "text-warn" : "text-white",
                  )}
                >
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label="Show"
              value={view}
              onChange={setView}
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "own", label: "Own round", count: counts.own },
                { value: "carry", label: "Carry-over", count: counts.carry },
              ]}
            />
            <label className="flex min-h-[40px] cursor-pointer items-center gap-3 text-[13px] text-silver">
              <Switch label="Never logged in only" checked={neverOnly} onCheckedChange={setNeverOnly} />
              Never logged in only
            </label>
          </div>

          {list.length === 0 ? (
            <EmptyState>
              {all.length === 0 ? `Everyone expected in round ${round} has bid.` : "Nobody matches this filter."}
            </EmptyState>
          ) : (
            <div className="surface-card overflow-hidden">
              {/* phones */}
              <ul className="md:hidden">
                {list.map(n => (
                  <li key={n._id} className="border-b border-hairline px-4 py-3 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-[15px] text-white">{n.name}</p>
                      <span className="shrink-0 text-[13px] tabular-nums text-mist">{n.points} pts</span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-silver">
                      <span>{n.username}</span>
                      <span>{n.room}</span>
                      <GenderTag gender={n.gender} />
                      <span>R{n.round}</span>
                      {n.carryover && <CarryTag />}
                      {n.lastLogin == null && <NeverBadge />}
                    </p>
                  </li>
                ))}
              </ul>
              {/* desktop */}
              <table className="hidden w-full text-sm tabular-nums md:table">
                <thead className="border-b border-hairline bg-recessed/60 text-left">
                  <tr className="[&>th]:h-10 [&>th]:px-3 [&>th]:text-[11px] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.12em] [&>th]:text-silver">
                    <th className="!pl-5">Resident</th>
                    <th>Room</th>
                    <th>Gender</th>
                    <th>Own round</th>
                    <th className="text-right">Points</th>
                    <th className="!pr-5">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(n => (
                    <tr key={n._id} className={cn("border-b border-hairline last:border-0")}>
                      <td className="max-w-[20rem] py-2.5 pl-5 pr-3">
                        <span className="block truncate text-white">{n.name}</span>
                        <span className="text-xs text-[#93a19f]">{n.username}</span>
                      </td>
                      <td className="px-3 py-2.5 text-silver">{n.room}</td>
                      <td className="px-3 py-2.5">
                        <GenderTag gender={n.gender} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-2 text-silver">
                          {n.round} {n.carryover && <CarryTag />}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-mist">{n.points}</td>
                      <td className="whitespace-nowrap py-2.5 pl-3 pr-5 text-silver">
                        {n.lastLogin == null ? <NeverBadge /> : formatLastSeen(n.lastLogin, now)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
