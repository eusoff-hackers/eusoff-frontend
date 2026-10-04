"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown, RefreshCw } from "lucide-react";

import { errorMessage } from "@/src/app/lib/api";

/** Shared building blocks for the abyssal-teal system (resident + admin). */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
        <h1 className="text-[clamp(1.5rem,1.2rem+1.3vw,2.125rem)] font-medium leading-[1.08] tracking-[-0.03em] text-heading">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-[62ch] text-sm text-silver sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
  as: As = "section",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  as?: "section" | "div" | "article";
}) {
  return (
    <As className={cn("surface-card min-w-0 p-4 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {title && <h2 className="text-[17px] font-medium leading-tight tracking-heading text-heading">{title}</h2>}
            {description && <p className="mt-1 text-[13px] text-silver">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </As>
  );
}

/** Stat tile: small label over a big tabular number. `accent` puts the number in lavender (big stats only). */
export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  accent = false,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "warn";
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("surface-card min-w-0 p-4", tone === "warn" && "border-warn/40", className)}>
      <p className="eyebrow truncate">{label}</p>
      <p
        className={cn(
          "mt-2.5 text-[clamp(1.5rem,1.15rem+1.3vw,2.125rem)] font-medium leading-none tracking-[-0.035em] tabular-nums",
          accent ? "text-lavender" : tone === "warn" ? "text-warn" : "text-heading",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 truncate text-[13px] text-silver">{hint}</p>}
    </div>
  );
}

/** Native select styled like Input (keeps the native picker on phones). */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative min-w-0", className)}>
      <select
        ref={ref}
        className="h-11 w-full min-w-0 appearance-none rounded-md border border-ink/[0.16] bg-field pl-3 pr-9 text-[15px] text-mist transition-colors hover:border-ink/20 focus-visible:border-aqua/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua/25 disabled:opacity-50 [&>option]:bg-raised"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={1.5}
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver"
      />
    </div>
  ),
);
Select.displayName = "Select";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-raised disabled:opacity-50",
        checked ? "border-aqua/40 bg-aqua/30" : "border-ink/15 bg-recessed",
        // Generous hit area without changing the visual size
        "before:absolute before:-inset-2 before:content-['']",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full transition-transform duration-200 ease-out",
          checked ? "translate-x-[22px] bg-aqua" : "translate-x-[3px] bg-silver",
        )}
      />
    </button>
  );
}

/** Segmented control (radio-group semantics). */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; count?: number }[];
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("scrollbar-none inline-flex max-w-full overflow-x-auto rounded-lg bg-recessed p-1", className)}
    >
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua",
              active ? "bg-raised text-heading outline outline-1 -outline-offset-1 outline-ink/10" : "text-silver hover:text-heading",
            )}
          >
            {o.label}
            {o.count != null && <span className={cn("tabular-nums", active ? "text-silver" : "text-faint")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink/[0.05]", className)} />;
}

export function LoadingBlock({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry, title }: { error: unknown; onRetry?: () => void; title?: string }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-danger/30 bg-raised p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" strokeWidth={1.5} aria-hidden />
        <div>
          <p className="font-medium text-heading">{title ?? "This data didn't load"}</p>
          <p className="mt-0.5 text-sm text-silver">{errorMessage(error)}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-dashed border-ink/[0.12] px-4 py-8 text-center text-sm text-silver",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function GenderTag({ gender }: { gender: string | null | undefined }) {
  const known = gender === "male" || gender === "female";
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] px-1 text-[11px] font-medium leading-none",
        !known
          ? "border border-dashed border-warn/60 text-warn"
          : "bg-ink/[0.07] text-mist",
      )}
      title={known ? gender! : "Gender unknown"}
    >
      {gender === "female" ? "F" : gender === "male" ? "M" : "?"}
      <span className="sr-only">{known ? ` ${gender}` : " gender unknown"}</span>
    </span>
  );
}

/** A jersey number as a compact tile. */
export function NumberChip({
  n,
  className,
  highlight,
}: {
  n: number | null;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 min-w-[2.25rem] items-center justify-center rounded-md px-1.5 text-sm font-medium tabular-nums",
        n == null ? "border border-dashed border-ink/15 text-faint" : "bg-recessed text-mist",
        highlight && "bg-lavender/10 text-lavender outline outline-1 -outline-offset-1 outline-lavender/40",
        className,
      )}
    >
      {n ?? "–"}
    </span>
  );
}

/** Status line with a meaningful colour token. */
export function Callout({
  tone = "info",
  icon: Icon,
  title,
  children,
  className,
}: {
  tone?: "info" | "warn" | "danger" | "open";
  icon?: React.ElementType;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-hairline bg-recessed text-silver",
    open: "border-aqua/25 bg-aqua/[0.06] text-silver",
    warn: "border-warn/30 bg-warn/[0.05] text-silver",
    danger: "border-danger/30 bg-danger/[0.07] text-silver",
  } as const;
  const iconTone = { info: "text-silver", open: "text-aqua", warn: "text-warn", danger: "text-danger" }[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-3.5 text-sm sm:p-4", tones[tone], className)}>
      {Icon && <Icon className={cn("mt-0.5 h-[18px] w-[18px] shrink-0", iconTone)} strokeWidth={1.5} aria-hidden />}
      <div className="min-w-0">
        {title && <p className="font-medium text-heading">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}

/** Flag for residents who have never signed in. */
export function NeverBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-[4px] border border-warn/35 px-1.5 text-[11px] font-medium leading-none text-warn",
        className,
      )}
    >
      Never logged in
    </span>
  );
}
