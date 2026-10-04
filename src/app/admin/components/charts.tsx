"use client";

import React, { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Minimal dependency-free chart kit, theme-aware through CSS variables.
 * Series colours are validated categorical sets (CVD ΔE ≥ 8, ≥ 3:1 vs the card surface) per theme:
 *   light on #ffffff: #3f6fb5 slate blue, #b5404f crest red, #b8860b gold (all-pairs pass)
 *   dark on #261a1d:  #5585cc slate blue, #cf5a68 crest red, #b98a26 gold (all-pairs pass)
 * Text always uses text tokens, never series colours. Every mark has a hover/focus tooltip.
 */
export const SERIES = ["rgb(var(--viz-1))", "rgb(var(--viz-2))", "rgb(var(--viz-3))"] as const;
export const NEUTRAL = "rgb(var(--ink) / 0.16)";

/**
 * Single-hue sequential ramp for magnitude, binned into 5 steps (apricot to crest maroon on light,
 * deep maroon to gold on dark). Binning keeps every label at ≥ 5:1: a continuous ramp always has a
 * mid band where neither ink reaches AA.
 */
export function seqStep(value: number, max: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (value <= 0 || max <= 0) return 0;
  return Math.min(5, Math.max(1, Math.ceil((value / max) * 5))) as 1 | 2 | 3 | 4 | 5;
}
export const seqColor = (step: number) => `rgb(var(--seq-${Math.max(1, Math.min(5, step))}))`;
export const seqText = (step: number) => (step >= 4 ? "text-seq-on-hi" : "text-seq-on-lo");
export const SEQ_GRADIENT = `linear-gradient(90deg, ${[1, 2, 3, 4, 5].map(seqColor).join(", ")})`;

export const fmt = (n: number) => n.toLocaleString("en-SG");
export const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "–");

/** Tooltip state anchored to the chart container. */
export function useChartTooltip<T>() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; data: T } | null>(null);
  const show = (el: Element, data: T) => {
    const box = ref.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!box) return;
    setTip({ x: r.left + r.width / 2 - box.left, y: r.top - box.top, data });
  };
  const bind = (data: T) => ({
    onMouseEnter: (e: React.MouseEvent) => show(e.currentTarget, data),
    onFocus: (e: React.FocusEvent) => show(e.currentTarget, data),
    onMouseLeave: () => setTip(null),
    onBlur: () => setTip(null),
  });
  return { ref, tip, bind, hide: () => setTip(null) };
}

export function ChartTooltip({
  tip,
  width,
  children,
}: {
  tip: { x: number; y: number } | null;
  width: number;
  children: React.ReactNode;
}) {
  if (!tip) return null;
  // keep inside the container horizontally
  const left = Math.max(70, Math.min(width - 70, tip.x));
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-lg border border-ink/15 bg-raised px-3 py-2 [box-shadow:var(--pop-shadow)] text-xs text-silver"
      style={{ left, top: tip.y }}
    >
      {children}
    </div>
  );
}

export function TipRow({ color, label, value }: { color?: string; label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {color && <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: color }} aria-hidden />}
      <span className="flex-1">{label}</span>
      <span className="pl-3 font-medium tabular-nums text-heading">{value}</span>
    </div>
  );
}

export function Legend({ items, className }: { items: { color: string; label: string }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-silver", className)}>
      {items.map(i => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Container width for tooltip clamping. */
function useWidth(ref: React.RefObject<HTMLDivElement>) {
  return ref.current?.clientWidth ?? 320;
}

export interface ColumnDatum {
  key: string | number;
  /** One value per series (stacked bottom-up in series order). */
  values: number[];
  label?: string;
  tooltip?: React.ReactNode;
}

/**
 * Vertical (optionally stacked) columns. Rounded 3px data-ends, 2px surface gaps between stacked
 * segments, recessive baseline, sparse x labels.
 */
export function ColumnChart({
  data,
  colors = SERIES as unknown as string[],
  height = 160,
  labelEvery = 1,
  ariaLabel,
  max: maxOverride,
  gap = 2,
}: {
  data: ColumnDatum[];
  colors?: string[];
  height?: number;
  labelEvery?: number;
  ariaLabel: string;
  max?: number;
  gap?: number;
}) {
  const { ref, tip, bind } = useChartTooltip<ColumnDatum>();
  const width = useWidth(ref);
  const max = maxOverride ?? Math.max(1, ...data.map(d => d.values.reduce((a, b) => a + b, 0)));
  const gridLines = [0.5, 1];

  return (
    <figure className="min-w-0">
      <div ref={ref} className="relative" style={{ height: height + 22 }}>
        {/* recessive grid */}
        {gridLines.map(g => (
          <div
            key={g}
            aria-hidden
            className="absolute inset-x-0 border-t border-dashed border-ink/[0.06]"
            style={{ top: height - g * height }}
          >
            <span className="absolute -top-2 right-0 text-[10px] tabular-nums text-faint">
              {fmt(Math.round(max * g))}
            </span>
          </div>
        ))}
        <div
          className="absolute left-0 right-8 top-0 flex items-end"
          style={{ height, gap }}
          role="img"
          aria-label={ariaLabel}
        >
          {data.map(d => {
            const total = d.values.reduce((a, b) => a + b, 0);
            return (
              <div
                key={d.key}
                tabIndex={0}
                {...bind(d)}
                className="group relative flex h-full min-w-0 flex-1 cursor-default flex-col-reverse justify-start outline-none focus-visible:ring-1 focus-visible:ring-aqua"
              >
                {/* enlarged hit area: the whole column */}
                {d.values.map((v, i) =>
                  v > 0 ? (
                    <div
                      key={i}
                      className={cn(
                        "w-full transition-opacity group-hover:opacity-100",
                        tip && tip.data.key !== d.key ? "opacity-60" : "opacity-100",
                        i === d.values.length - 1 || d.values.slice(i + 1).every(x => x === 0) ? "rounded-t-[3px]" : "",
                      )}
                      style={{
                        height: `${(v / max) * 100}%`,
                        background: colors[i % colors.length],
                        marginTop: i > 0 ? 2 : 0,
                        minHeight: 2,
                      }}
                    />
                  ) : null,
                )}
                {total === 0 && <div className="h-px w-full bg-ink/10" />}
              </div>
            );
          })}
        </div>
        {/* baseline + x labels */}
        <div aria-hidden className="absolute left-0 right-8 border-t border-ink/15" style={{ top: height }} />
        <div aria-hidden className="absolute left-0 right-8" style={{ top: height + 6 }}>
          {data.map((d, i) => {
            const text = i % labelEvery === 0 ? (d.label !== undefined ? d.label : String(d.key)) : "";
            if (!text) return null;
            return (
              <span
                key={d.key}
                className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] tabular-nums text-faint"
                style={{ left: `${((i + 0.5) / data.length) * 100}%` }}
              >
                {text}
              </span>
            );
          })}
        </div>
        <ChartTooltip tip={tip} width={width}>
          {tip?.data.tooltip}
        </ChartTooltip>
      </div>
    </figure>
  );
}

/** Horizontal bar with value label; no background track. */
export function HBar({
  value,
  max,
  color = SERIES[0],
  label,
  valueLabel,
  className,
}: {
  value: number;
  max: number;
  color?: string;
  label: React.ReactNode;
  valueLabel?: React.ReactNode;
  className?: string;
}) {
  const w = max > 0 ? Math.max(value > 0 ? 1.5 : 0, (value / max) * 100) : 0;
  return (
    <div className={cn("grid grid-cols-[minmax(0,7.5rem),1fr] items-center gap-3 text-[13px]", className)}>
      <span className="truncate text-silver">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <div className="h-2 rounded-r-[3px]" style={{ width: `${w}%`, background: color }} />
        <span className="shrink-0 tabular-nums text-mist">{valueLabel ?? fmt(value)}</span>
      </div>
    </div>
  );
}

/** One 100% stacked bar with labelled segments (2px surface gap). */
export function StackBar({
  segments,
  height = 10,
  ariaLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  height?: number;
  ariaLabel: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const id = useId();
  if (total === 0) return <div className="h-2.5 rounded-[3px] bg-ink/[0.06]" aria-label={`${ariaLabel}: no data`} />;
  return (
    <div className="flex w-full gap-[2px]" role="img" aria-label={ariaLabel} aria-describedby={id} style={{ height }}>
      {segments
        .filter(s => s.value > 0)
        .map((s, i, arr) => (
          <div
            key={s.label}
            title={`${s.label}: ${fmt(s.value)}`}
            className={cn(i === 0 && "rounded-l-[3px]", i === arr.length - 1 && "rounded-r-[3px]")}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          />
        ))}
      <span id={id} className="sr-only">
        {segments.map(s => `${s.label} ${s.value}`).join(", ")}
      </span>
    </div>
  );
}
