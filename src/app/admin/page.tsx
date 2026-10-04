"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { useOverview } from "@/src/app/admin/api";
import { ColumnChart, Legend, SERIES, TipRow, fmt, pct } from "@/src/app/admin/components/charts";
import { EmptyState, ErrorState, PageHeader, Panel, Skeleton, StatCard } from "@/src/app/admin/components/ui";
import type { Overview } from "@/src/app/admin/types";
import RoundTimeline from "@/src/app/components/RoundTimeline";
import { formatCountdown, formatRelative, formatSgtTime, useNow } from "@/src/app/lib/time";

const ROUNDS = [1, 2, 3, 4];

const PHASE_LABEL: Record<Overview["current"]["phase"], string> = {
  before: "Bidding hasn't started",
  open: "Bidding open",
  between: "Between rounds",
  done: "All rounds finished",
};

/** Per round: residents in that round, how many bid, how many got a number. Bars share one scale. */
function RoundProgress({ data }: { data: Overview }) {
  const max = Math.max(1, ...ROUNDS.map(r => data.byRound[String(r)] ?? 0));
  return (
    <div>
      <Legend
        className="mb-4"
        items={[
          { color: "rgba(255,255,255,0.18)", label: "Residents" },
          { color: SERIES[0], label: "Bid" },
          { color: SERIES[1], label: "Allocated" },
        ]}
      />
      <ul className="space-y-4">
        {ROUNDS.map(r => {
          const key = String(r);
          const total = data.byRound[key] ?? 0;
          const bidders = data.bidders[key] ?? 0;
          const allocated = data.allocated[key] ?? 0;
          const rows = [
            { v: total, c: "rgba(255,255,255,0.18)", l: "Residents" },
            { v: bidders, c: SERIES[0], l: "Bid" },
            { v: allocated, c: SERIES[1], l: "Allocated" },
          ];
          return (
            <li key={r} className="grid grid-cols-[4.5rem,1fr] items-center gap-3">
              <div>
                <p className="text-sm text-white">Round {r}</p>
                <p className="text-xs tabular-nums text-[#93a19f]">{pct(bidders, total)} bid</p>
              </div>
              <div className="space-y-[3px]" role="img" aria-label={`Round ${r}: ${total} residents, ${bidders} bid, ${allocated} allocated`}>
                {rows.map(row => (
                  <div key={row.l} className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-r-[3px]"
                      style={{ width: `${Math.max(row.v ? 1 : 0, (row.v / max) * 88)}%`, background: row.c }}
                    />
                    <span className="text-[11px] tabular-nums text-silver">{fmt(row.v)}</span>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PointsChart({ data }: { data: Overview["pointsDistribution"] }) {
  if (data.length === 0) return <EmptyState>No points data yet.</EmptyState>;
  return (
    <>
      <ColumnChart
        ariaLabel="Residents at each points total"
        height={150}
        data={data.map(d => ({
          key: d.points,
          values: [d.count],
          tooltip: <TipRow label={`${d.points} points`} value={`${fmt(d.count)} residents`} />,
        }))}
      />
      <p className="mt-1 text-center text-[11px] text-[#93a19f]">Points</p>
    </>
  );
}

function TopNumbers({ data }: { data: Overview["topNumbers"] }) {
  if (data.length === 0) return <EmptyState>No bids in the current round yet.</EmptyState>;
  const max = Math.max(...data.map(d => d.bids), 1);
  return (
    <ol className="space-y-2.5">
      {data.map(d => (
        <li key={d.number} className="flex items-center gap-3">
          <span className="inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-recessed text-sm font-medium tabular-nums text-mist">
            {d.number}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-2 rounded-r-[3px] bg-viz-1" style={{ width: `${(d.bids / max) * 85}%` }} />
            <span className="shrink-0 text-[13px] tabular-nums text-mist">{d.bids}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Activity({ data, now }: { data: Overview["recentActivity"]; now: number }) {
  if (data.length === 0) return <EmptyState>No activity yet.</EmptyState>;
  const label = (a: string) =>
    a === "USER LOGIN" ? "Signed in" : a === "USER PLACE BIDS" ? "Updated bids" : a.charAt(0) + a.slice(1).toLowerCase();
  return (
    <ul className="-mr-2 max-h-[22rem] overflow-y-auto pr-2">
      {data.map((a, i) => (
        <li
          key={`${a.timestamp}-${i}`}
          className="flex items-start justify-between gap-3 border-b border-hairline py-2.5 text-sm last:border-0"
        >
          <div className="min-w-0">
            <p className="truncate text-mist">{a.user?.name ?? "System"}</p>
            <p className="truncate text-xs text-[#93a19f]">
              {label(a.action)}
              {a.user?.room && a.user.room !== "-" ? ` · ${a.user.room}` : ""}
            </p>
          </div>
          <time
            className="shrink-0 pt-0.5 text-xs tabular-nums text-silver"
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

function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-4 h-9 w-56" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-40 rounded-2xl" />
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, error, refetch, isLoading } = useOverview();
  const now = useNow(1000, data?.now);

  if (isLoading) return <OverviewSkeleton />;
  if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;

  const cur = String(data.current.round);
  const totalAllocated = data.residents - data.unallocated;
  const closesIn =
    data.current.phase === "open" && data.current.close > now ? formatCountdown(data.current.close - now) : null;

  return (
    <>
      <PageHeader
        eyebrow={
          <span className={cn(data.current.phase === "open" && "text-aqua")}>
            {PHASE_LABEL[data.current.phase]}
            {data.current.round ? ` / Round ${data.current.round}` : ""}
          </span>
        }
        title="Overview"
        description={closesIn ? `Round ${data.current.round} closes in ${closesIn}.` : undefined}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Allocated" value={fmt(totalAllocated)} hint={`${pct(totalAllocated, data.residents)} of residents`} accent className="col-span-2 lg:col-span-1" />
        <StatCard label="Residents" value={fmt(data.residents)} hint={`${data.byGender.male} M, ${data.byGender.female} F`} />
        <StatCard
          label={`Bidders R${data.current.round || "–"}`}
          value={fmt(data.bidders[cur] ?? 0)}
          hint={`of ${data.byRound[cur] ?? 0} in round`}
        />
        <StatCard label="Unallocated" value={fmt(data.unallocated)} />
        <Link
          href="/admin/issues"
          className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
        >
          <StatCard
            label="Data issues"
            value={fmt(data.issuesOpen)}
            hint={
              <span className="inline-flex items-center gap-1 group-hover:text-white">
                Review <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </span>
            }
            tone={data.issuesOpen > 0 ? "warn" : "default"}
            className="h-full transition-colors group-hover:border-warn/50"
          />
        </Link>
      </div>

      <Panel title="Rounds" className="mt-4">
        <RoundTimeline rounds={data.rounds} now={now} highlightRound={data.current.round} highlightLabel="Current" />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Progress by round" description="Out of everyone whose own round it is">
          <RoundProgress data={data} />
        </Panel>
        <Panel title="Points distribution" description="Residents at each points total">
          <PointsChart data={data.pointsDistribution} />
        </Panel>
        <Panel
          title="Most-bid numbers"
          description="Current round, any choice"
          actions={
            <Link href="/admin/analytics" className="text-[13px] text-aqua underline-offset-4 hover:underline">
              Full demand map
            </Link>
          }
        >
          <TopNumbers data={data.topNumbers} />
        </Panel>
        <Panel title="Recent activity" description="Refreshes every 15 seconds">
          <Activity data={data.recentActivity} now={now} />
        </Panel>
      </div>
    </>
  );
}
