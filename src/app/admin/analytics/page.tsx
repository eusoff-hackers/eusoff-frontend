"use client";

import React, { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { useAnalytics } from "@/src/app/admin/api";
import {
  ChartTooltip,
  ColumnChart,
  Legend,
  SERIES,
  StackBar,
  TipRow,
  fmt,
  pct,
  SEQ_GRADIENT,
  seqColor,
  seqStep,
  seqText,
  useChartTooltip,
} from "@/src/app/admin/components/charts";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  Segmented,
  Skeleton,
  StatCard,
} from "@/src/app/admin/components/ui";
import type { Analytics, AnalyticsRound } from "@/src/app/admin/types";
import { StatusPill } from "@/src/app/components/RoundTimeline";
import { formatRelative, useNow } from "@/src/app/lib/time";

const ORD = ["1st", "2nd", "3rd", "4th", "5th"];
/** 5-step sequential ramp for ordered choice ranks (1st = brightest). */
const RANK_COLORS = [5, 4, 3, 2, 1].map(seqColor);
const NEUTRAL = "rgb(var(--ink) / 0.16)";

/* ------------------------------------------------------------------ funnel */

function Funnel({ rounds }: { rounds: AnalyticsRound[] }) {
  const max = Math.max(1, ...rounds.map(r => Math.max(r.eligible + r.carryover, r.bidders)));
  const rows = (r: AnalyticsRound) => [
    { label: "Expected", value: r.eligible, sub: r.carryover ? `+${r.carryover} carry-over` : undefined, color: NEUTRAL },
    { label: "Bid", value: r.bidders, color: SERIES[0] },
    { label: "Allocated", value: r.allocated, color: SERIES[1] },
  ];
  return (
    <>
      <Legend
        className="mb-5"
        items={[
          { color: NEUTRAL, label: "Expected (own round)" },
          { color: SERIES[0], label: "Bid" },
          { color: SERIES[1], label: "Allocated" },
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {rounds.map(r => (
          <article key={r.round} className="min-w-0 rounded-xl bg-recessed p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-medium text-heading">Round {r.round}</h3>
              <StatusPill status={r.status} />
            </div>
            <div className="mt-4 space-y-2.5" role="img" aria-label={`Round ${r.round}: ${r.eligible} expected, ${r.carryover} carry-over, ${r.bidders} bid, ${r.allocated} allocated`}>
              {rows(r).map(row => (
                <div key={row.label} className="grid grid-cols-[4.5rem,1fr] items-center gap-3 text-[13px]">
                  <span className="text-silver">{row.label}</span>
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="h-2 shrink-0 rounded-r-[3px]"
                      style={{ width: `${Math.max(row.value ? 1.5 : 0, (row.value / max) * 75)}%`, background: row.color }}
                    />
                    <span className="truncate tabular-nums text-mist">
                      {fmt(row.value)}
                      {row.sub && <span className="ml-1.5 text-faint">{row.sub}</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3 text-[13px]">
              <div>
                <dt className="text-silver">Didn&apos;t bid</dt>
                <dd className="mt-0.5 flex items-center gap-2 tabular-nums">
                  <span className={cn("text-lg font-medium", r.nonBidders ? "text-warn" : "text-heading")}>
                    {fmt(r.nonBidders)}
                  </span>
                  {r.status !== "scheduled" && (
                    <Link
                      href={`/admin/rounds/${r.round}/non-bidders`}
                      className="inline-flex h-8 items-center gap-0.5 rounded-md px-1.5 text-xs text-aqua hover:bg-aqua/10"
                    >
                      List <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    </Link>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-silver">Bid, no number</dt>
                <dd className="mt-0.5 text-lg font-medium tabular-nums text-heading">{fmt(r.unallocatedBidders)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <details className="group mt-4 text-[13px]">
        <summary className="inline-flex h-10 cursor-pointer items-center rounded-md px-2 text-silver hover:text-heading">
          Show as table
        </summary>
        <div className="mt-2 overflow-x-auto rounded-xl bg-recessed">
          <table className="w-full min-w-[560px] tabular-nums">
            <thead>
              <tr className="border-b border-hairline text-left [&>th]:h-9 [&>th]:px-3 [&>th]:font-medium [&>th]:text-silver">
                <th>Round</th>
                <th>Expected</th>
                <th>Carry-over</th>
                <th>Bid</th>
                <th>Didn&apos;t bid</th>
                <th>Allocated</th>
                <th>Bid, no number</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map(r => (
                <tr key={r.round} className="border-b border-hairline text-mist last:border-0 [&>td]:px-3 [&>td]:py-2">
                  <td>{r.round}</td>
                  <td>{r.eligible}</td>
                  <td>{r.carryover}</td>
                  <td>{r.bidders}</td>
                  <td>{r.nonBidders}</td>
                  <td>{r.allocated}</td>
                  <td>{r.unallocatedBidders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}

/* ------------------------------------------------------------- choice hits */

function ChoiceHits({ rounds }: { rounds: AnalyticsRound[] }) {
  const totals = [0, 1, 2, 3, 4].map(i => rounds.reduce((a, r) => a + (r.choiceHits[i] ?? 0), 0));
  const all = totals.reduce((a, b) => a + b, 0);
  if (all === 0) return <EmptyState>Shows once a round has been allocated.</EmptyState>;
  const withHits = rounds.filter(r => r.choiceHits.some(Boolean));
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-silver">
          <span className="text-[2rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-lavender">
            {pct(totals[0], all)}
          </span>{" "}
          got their 1st choice
        </p>
        <div className="mt-4">
          <ColumnChart
            ariaLabel="Allocated residents by which choice they got"
            height={120}
            gap={12}
            data={totals.map((v, i) => ({
              key: ORD[i],
              values: [v],
              tooltip: <TipRow label={`${ORD[i]} choice`} value={`${fmt(v)} (${pct(v, all)})`} />,
            }))}
            colors={[SERIES[0]]}
          />
        </div>
      </div>
      {withHits.length > 0 && (
        <div className="space-y-3">
          <Legend items={ORD.map((o, i) => ({ color: RANK_COLORS[i], label: o }))} />
          {withHits.map(r => {
            const sum = r.choiceHits.reduce((a, b) => a + b, 0);
            return (
              <div key={r.round} className="grid grid-cols-[4.5rem,1fr,2.5rem] items-center gap-3 text-[13px]">
                <span className="text-silver">Round {r.round}</span>
                <StackBar
                  ariaLabel={`Round ${r.round} choice ranks`}
                  segments={r.choiceHits.map((v, i) => ({ label: `${ORD[i]} choice`, value: v, color: RANK_COLORS[i] }))}
                />
                <span className="text-right tabular-nums text-mist">{sum}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- heatmap */

type ChoiceFilter = "all" | 0 | 1 | 2 | 3 | 4;
type GenderFilter = "both" | "male" | "female";

function DemandMap({ demand }: { demand: Analytics["demand"] }) {
  const [choice, setChoice] = useState<ChoiceFilter>("all");
  const [gender, setGender] = useState<GenderFilter>("both");
  const { ref, tip, bind } = useChartTooltip<Analytics["demand"][number]>();

  const valueOf = (d: Analytics["demand"][number]) =>
    gender !== "both" ? d[gender] : choice === "all" ? d.total : d.byChoice[choice] ?? 0;
  const byNumber = useMemo(() => [...demand].sort((a, b) => a.number - b.number), [demand]);
  const max = Math.max(1, ...byNumber.map(valueOf));
  const total = byNumber.reduce((a, d) => a + valueOf(d), 0);
  const top = [...byNumber].sort((a, b) => valueOf(b) - valueOf(a)).slice(0, 3);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Segmented<ChoiceFilter>
          label="Choice rank"
          value={gender === "both" ? choice : "all"}
          onChange={v => {
            setChoice(v);
            setGender("both");
          }}
          options={[{ value: "all" as ChoiceFilter, label: "Any choice" }, ...[0, 1, 2, 3, 4].map(i => ({ value: i as ChoiceFilter, label: ORD[i] }))]}
        />
        <Segmented<GenderFilter>
          label="Gender"
          value={gender}
          onChange={v => {
            setGender(v);
            if (v !== "both") setChoice("all");
          }}
          options={[
            { value: "both", label: "Everyone" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),14rem]">
        <div ref={ref} className="relative">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5" role="grid" aria-label="Bids per number, 0 to 99">
            {byNumber.map(d => {
              const v = valueOf(d);
              const step = seqStep(v, max);
              return (
                <div
                  key={d.number}
                  role="gridcell"
                  tabIndex={0}
                  {...bind(d)}
                  aria-label={`Number ${d.number}: ${v} bids${d.holders ? `, ${d.holders} holders` : ""}`}
                  className={cn(
                    "relative flex aspect-square min-w-0 cursor-default items-center justify-center rounded-[4px] text-[11px] tabular-nums outline-none transition-[outline-color] focus-visible:ring-2 focus-visible:ring-aqua sm:text-[13px]",
                    v === 0 ? "bg-recessed text-faint" : seqText(step),
                    tip?.data.number === d.number && "outline outline-1 outline-ink/60",
                  )}
                  style={v ? { background: seqColor(step) } : undefined}
                >
                  {d.number}
                  {d.holders > 0 && (
                    <span
                      aria-hidden
                      className="absolute right-[3px] top-[3px] h-1.5 w-1.5 rounded-full bg-lavender-fill ring-1 ring-canvas/60"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <ChartTooltip tip={tip} width={ref.current?.clientWidth ?? 320}>
            {tip && (
              <div className="min-w-[10rem] space-y-1">
                <p className="mb-1 text-sm font-medium text-heading">Number {tip.data.number}</p>
                <TipRow label="All bids" value={tip.data.total} />
                {tip.data.byChoice.map((c, i) => (
                  <TipRow key={i} color={RANK_COLORS[i]} label={`${ORD[i]} choice`} value={c} />
                ))}
                <TipRow label="Male / female" value={`${tip.data.male} / ${tip.data.female}`} />
                <TipRow label="Holders" value={tip.data.holders} />
              </div>
            )}
          </ChartTooltip>
        </div>

        <aside className="space-y-5 text-[13px]">
          <div>
            <p className="text-silver">Bids shown</p>
            <p className="mt-1 text-[2rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-heading">
              {fmt(total)}
            </p>
          </div>
          <div>
            <div
              className="h-2.5 w-full rounded-[3px]"
              style={{ background: SEQ_GRADIENT }}
              aria-hidden
            />
            <div className="mt-1.5 flex justify-between tabular-nums text-faint">
              <span>1</span>
              <span>{fmt(max)} bids</span>
            </div>
            <p className="mt-3 flex items-center gap-2 text-silver">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-fill" aria-hidden /> Already held by someone
            </p>
          </div>
          <div>
            <p className="mb-2 text-silver">Most wanted</p>
            <ol className="space-y-1.5">
              {top.map(d => (
                <li key={d.number} className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-md bg-recessed px-1.5 font-medium tabular-nums text-mist">
                    {d.number}
                  </span>
                  <span className="tabular-nums text-mist">{valueOf(d)}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- points/outcome */

function PointsOutcome({ points }: { points: Analytics["points"] }) {
  if (points.length === 0) return <EmptyState>No points data yet.</EmptyState>;
  const colors = [SERIES[0], SERIES[1], NEUTRAL];
  return (
    <>
      <Legend
        className="mb-4"
        items={[
          { color: colors[0], label: "Got 1st choice" },
          { color: colors[1], label: "Got another number" },
          { color: colors[2], label: "No number yet" },
        ]}
      />
      <ColumnChart
        ariaLabel="Outcome by points total"
        height={170}
        colors={colors}
        data={points.map(p => ({
          key: p.points,
          values: [p.gotTopChoice, Math.max(0, p.allocated - p.gotTopChoice), Math.max(0, p.residents - p.allocated)],
          tooltip: (
            <div className="space-y-1">
              <p className="mb-1 text-sm font-medium text-heading">{p.points} points</p>
              <TipRow label="Residents" value={p.residents} />
              <TipRow color={colors[0]} label="Got 1st choice" value={p.gotTopChoice} />
              <TipRow color={colors[1]} label="Got another" value={p.allocated - p.gotTopChoice} />
              <TipRow color={colors[2]} label="No number yet" value={p.residents - p.allocated} />
              <TipRow label="Allocated" value={pct(p.allocated, p.residents)} />
            </div>
          ),
        }))}
      />
      <p className="mt-1 text-center text-[11px] text-faint">Points</p>
    </>
  );
}

/* ------------------------------------------------------------------ teams */

function Teams({ teams }: { teams: Analytics["teams"] }) {
  const [showAll, setShowAll] = useState(false);
  if (teams.length === 0) return <EmptyState>No team data.</EmptyState>;
  const sorted = [...teams].sort((a, b) => b.members - a.members);
  const shown = showAll ? sorted : sorted.slice(0, 10);
  const colors = [SERIES[1], SERIES[0], NEUTRAL];
  return (
    <>
      <Legend
        className="mb-4"
        items={[
          { color: colors[0], label: "Allocated" },
          { color: colors[1], label: "Bid, waiting" },
          { color: colors[2], label: "Not bid" },
        ]}
      />
      <ul className="space-y-3">
        {shown.map(t => {
          const bidWaiting = Math.max(0, t.bidders - t.allocated);
          return (
            <li key={t.team} className="grid grid-cols-[minmax(0,7.5rem),1fr,4.5rem] items-center gap-3 text-[13px]">
              <span className="truncate text-mist" title={t.team}>
                {t.team}
              </span>
              <StackBar
                ariaLabel={`${t.team}: ${t.members} members`}
                segments={[
                  { label: "Allocated", value: t.allocated, color: colors[0] },
                  { label: "Bid, waiting", value: bidWaiting, color: colors[1] },
                  { label: "Not bid", value: Math.max(0, t.members - t.allocated - bidWaiting), color: colors[2] },
                ]}
              />
              <span className="text-right tabular-nums text-silver">
                <span className="text-mist">{t.allocated}</span>/{t.members}
              </span>
            </li>
          );
        })}
      </ul>
      {sorted.length > 10 && (
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowAll(v => !v)}>
          {showAll ? "Show top 10" : `Show all ${sorted.length} teams`}
        </Button>
      )}
    </>
  );
}

/* --------------------------------------------------------------- activity */

const sgt = new Intl.DateTimeFormat("en-SG", { timeZone: "Asia/Singapore", weekday: "short", day: "numeric" });
const sgtHour = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
});
const hourOfDaySgt = (ms: number) => new Date(ms + 8 * 3600e3).getUTCHours();

function HourlyChart({
  series,
  color,
  label,
  unit,
}: {
  series: { hour: number; count: number }[];
  color: string;
  label: string;
  unit: string;
}) {
  const total = series.reduce((a, s) => a + s.count, 0);
  const peak = series.reduce((m, s) => (s.count > m.count ? s : m), series[0] ?? { hour: 0, count: 0 });
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-medium text-heading">{label}</h3>
        <p className="text-[13px] text-silver">
          <span className="tabular-nums text-mist">{fmt(total)}</span> in 7 days
          {peak.count > 0 && (
            <>
              , peak <span className="tabular-nums text-mist">{peak.count}</span> at {sgtHour.format(peak.hour)}
            </>
          )}
        </p>
      </div>
      {total === 0 ? (
        <EmptyState className="py-6">No {unit} in the last 7 days.</EmptyState>
      ) : (
        <ColumnChart
          ariaLabel={`${label} per hour, last 7 days`}
          height={110}
          gap={1}
          colors={[color]}
          data={series.map(s => ({
            key: s.hour,
            values: [s.count],
            label: hourOfDaySgt(s.hour) === 0 ? sgt.format(s.hour) : "",
            tooltip: <TipRow label={sgtHour.format(s.hour)} value={`${s.count} ${unit}`} />,
          }))}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- page */

function AnalyticsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-48" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-80 rounded-2xl" />
      <Skeleton className="mt-4 h-96 rounded-2xl" />
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, error, isLoading, refetch } = useAnalytics();
  const now = useNow(30_000);

  if (isLoading) return <AnalyticsSkeleton />;
  if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;

  const c = data.coverage;
  const current =
    data.rounds.find(r => r.status === "open") ??
    [...data.rounds].reverse().find(r => r.status !== "scheduled") ??
    data.rounds[0];

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Updated ${formatRelative(data.generatedAt, now)}. Refreshes every minute.`}
      />

      {/* Coverage */}
      <section aria-label="Coverage">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label="Have a number"
            value={pct(c.allocated, c.residents)}
            hint={`${fmt(c.allocated)} of ${fmt(c.residents)}`}
            accent
            className="col-span-2 lg:col-span-1"
          />
          <StatCard label="Residents" value={fmt(c.residents)} />
          <StatCard label="Still without" value={fmt(c.unallocated)} />
          <Link href="/admin/residents" className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua">
            <StatCard
              label="Gender unknown"
              value={fmt(c.unknownGender)}
              hint="Can't bid until set"
              tone={c.unknownGender ? "warn" : "default"}
              className="h-full"
            />
          </Link>
          <StatCard
            label="Never logged in"
            value={fmt(c.neverLoggedIn)}
            hint={`${pct(c.neverLoggedIn, c.residents)} of residents`}
            tone={c.neverLoggedIn ? "warn" : "default"}
          />
        </div>
        <div className="mt-3">
          <StackBar
            height={6}
            ariaLabel="Allocation coverage"
            segments={[
              { label: "Allocated", value: c.allocated, color: SERIES[1] },
              { label: "Without a number", value: c.unallocated, color: NEUTRAL },
            ]}
          />
        </div>
      </section>

      <Panel
        className="mt-6"
        title="Round funnel"
        description="Who was expected in each round, who bid, who got a number"
      >
        <Funnel rounds={data.rounds} />
      </Panel>

      <Panel
        className="mt-4"
        title={`Demand map, round ${current?.round ?? ""}`}
        description="Bids on each number this round. Tap or hover a number for the breakdown."
      >
        <DemandMap demand={data.demand} />
      </Panel>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <Panel title="Which choice people got" description="Allocated residents, by the rank of the number they got">
          <ChoiceHits rounds={data.rounds} />
        </Panel>
        <Panel title="Points and outcome" description="Residents at each points total, by result so far">
          <PointsOutcome points={data.points} />
        </Panel>
      </div>

      <Panel className="mt-4" title="Teams" description="First-cut teams, largest first">
        <Teams teams={data.teams} />
      </Panel>

      <Panel
        className="mt-4"
        title="Activity"
        description={`${fmt(data.activity.uniqueLogins)} residents have signed in at least once. Hours in Singapore time.`}
        bodyClassName="space-y-8"
      >
        <HourlyChart series={data.activity.loginsByHour} color={SERIES[0]} label="Sign-ins" unit="sign-ins" />
        <HourlyChart series={data.activity.bidsByHour} color={SERIES[1]} label="Bid updates" unit="bid updates" />
      </Panel>
    </>
  );
}
