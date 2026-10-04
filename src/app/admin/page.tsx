"use client";

import React from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";

import { useOverview } from "@/src/app/admin/api";
import { EmptyState, ErrorState, LoadingBlock, PageHeader, Panel, StatCard } from "@/src/app/admin/components/ui";
import type { Overview } from "@/src/app/admin/types";
import RoundTimeline from "@/src/app/components/RoundTimeline";
import { formatRelative, formatSgtTime, useNow } from "@/src/app/lib/time";

const ROUNDS = [1, 2, 3, 4];

const PHASE_LABEL: Record<Overview["current"]["phase"], string> = {
  before: "Bidding hasn't started",
  open: "Bidding open",
  between: "Between rounds",
  done: "All rounds finished",
};

function Bar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", className)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function RoundProgress({ data }: { data: Overview }) {
  return (
    <ul className="space-y-4">
      {ROUNDS.map(r => {
        const key = String(r);
        const total = data.byRound[key] ?? 0;
        const bidders = data.bidders[key] ?? 0;
        const allocated = data.allocated[key] ?? 0;
        return (
          <li key={r}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">Round {r}</span>
              <span className="tabular-nums text-muted-foreground">{total} residents</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">Bid</span>
                <Bar value={bidders} max={total} className="bg-amber-400" />
                <span className="w-10 shrink-0 text-right text-xs tabular-nums">{bidders}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">Allocated</span>
                <Bar value={allocated} max={total} className="bg-emerald-700" />
                <span className="w-10 shrink-0 text-right text-xs tabular-nums">{allocated}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PointsChart({ data }: { data: Overview["pointsDistribution"] }) {
  if (data.length === 0) return <EmptyState>No points data yet.</EmptyState>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <figure>
      <div className="flex h-36 items-end gap-1" role="img" aria-label="Number of residents at each points total">
        {data.map(d => (
          <div key={d.points} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] tabular-nums text-muted-foreground">{d.count}</span>
            <div
              className="w-full rounded-t bg-emerald-700"
              style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
              title={`${d.points} pts: ${d.count} residents`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 border-t pt-1">
        {data.map(d => (
          <span key={d.points} className="min-w-0 flex-1 text-center text-[11px] tabular-nums text-muted-foreground">
            {d.points}
          </span>
        ))}
      </div>
      <figcaption className="mt-1 text-center text-xs text-muted-foreground">Points</figcaption>
    </figure>
  );
}

function TopNumbers({ data }: { data: Overview["topNumbers"] }) {
  if (data.length === 0) return <EmptyState>No bids in the current round yet.</EmptyState>;
  const max = Math.max(...data.map(d => d.bids), 1);
  return (
    <ol className="space-y-2">
      {data.map(d => (
        <li key={d.number} className="flex items-center gap-3">
          <span className="inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-950 text-sm font-semibold tabular-nums text-amber-200">
            {d.number}
          </span>
          <Bar value={d.bids} max={max} className="bg-amber-400" />
          <span className="w-14 shrink-0 text-right text-sm tabular-nums">
            {d.bids} <span className="text-xs text-muted-foreground">bids</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Activity({ data, now }: { data: Overview["recentActivity"]; now: number }) {
  if (data.length === 0) return <EmptyState>No activity yet.</EmptyState>;
  return (
    <ul className="max-h-96 divide-y overflow-y-auto pr-1">
      {data.map((a, i) => (
        <li key={`${a.timestamp}-${i}`} className="flex items-start justify-between gap-3 py-2 text-sm">
          <div className="min-w-0">
            <p className="break-words">{a.action}</p>
            {a.user && (
              <p className="truncate text-xs text-muted-foreground">
                {a.user.name} · {a.user.room}
              </p>
            )}
          </div>
          <time
            className="shrink-0 text-xs tabular-nums text-muted-foreground"
            dateTime={new Date(a.timestamp).toISOString()}
            title={formatSgtTime(a.timestamp)}
          >
            {formatRelative(a.timestamp, now)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export default function AdminOverviewPage() {
  const { data, error, refetch, isLoading, dataUpdatedAt } = useOverview();
  const now = useNow(1000, data?.now);

  if (isLoading) return <LoadingBlock rows={6} />;
  if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;

  const cur = String(data.current.round);
  const totalAllocated = data.residents - data.unallocated;

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          <>
            {PHASE_LABEL[data.current.phase]}
            {data.current.round ? ` · Round ${data.current.round}` : ""} · updated{" "}
            {formatRelative(dataUpdatedAt, Date.now())}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Residents"
          value={data.residents}
          hint={`${data.byGender.male} M · ${data.byGender.female} F`}
        />
        <StatCard
          label={`Bidders R${data.current.round || "–"}`}
          value={data.bidders[cur] ?? 0}
          hint={`of ${data.byRound[cur] ?? 0} in round`}
        />
        <StatCard
          label="Allocated"
          value={totalAllocated}
          hint={`${data.residents ? Math.round((totalAllocated / data.residents) * 100) : 0}% of residents`}
        />
        <StatCard label="Unallocated" value={data.unallocated} />
        <Link
          href="/admin/issues"
          className="col-span-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-span-1"
        >
          <StatCard
            label="Open data issues"
            value={data.issuesOpen}
            hint="View issues →"
            tone={data.issuesOpen > 0 ? "warn" : "default"}
          />
        </Link>
      </div>

      <Panel title="Rounds" className="mt-4">
        <RoundTimeline rounds={data.rounds} now={now} highlightRound={data.current.round} highlightLabel="Current" />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Progress by round"
          description="Residents who have bid / been allocated, out of everyone in that round"
        >
          <RoundProgress data={data} />
        </Panel>
        <Panel title="Points distribution">
          <PointsChart data={data.pointsDistribution} />
        </Panel>
        <Panel title="Most-bid numbers" description="Current round, any choice">
          <TopNumbers data={data.topNumbers} />
        </Panel>
        <Panel title="Recent activity" description="Refreshes every 15 seconds">
          <Activity data={data.recentActivity} now={now} />
        </Panel>
      </div>
    </>
  );
}
