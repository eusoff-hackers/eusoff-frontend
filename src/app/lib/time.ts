import { useEffect, useState } from "react";

/** Singapore has no DST, so a fixed offset is exact. */
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;
const TZ = "Asia/Singapore";

/** epoch ms -> value for <input type="datetime-local">, expressed in SGT whatever the browser zone. */
export function toSgtInput(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "";
  return new Date(ms + SGT_OFFSET_MS).toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value (read as SGT) -> epoch ms. Returns NaN on bad input. */
export function fromSgtInput(value: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return NaN;
  const [, y, mo, d, h, mi] = m.map(Number);
  return Date.UTC(y, mo - 1, d, h, mi) - SGT_OFFSET_MS;
}

const dateTimeFmt = new Intl.DateTimeFormat("en-SG", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});
const dayFmt = new Intl.DateTimeFormat("en-SG", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("en-SG", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
});

export const formatSgt = (ms: number) => dateTimeFmt.format(ms);
export const formatSgtDay = (ms: number) => dayFmt.format(ms);
export const formatSgtTime = (ms: number) => timeFmt.format(ms);

/** "2d 4h 03m" / "4h 03m 09s" / "03m 09s" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${h}h ${pad(m)}m`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(m)}m ${pad(s)}s`;
}

export function formatRelative(ms: number, now: number): string {
  const diff = Math.round((now - ms) / 1000);
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return formatSgt(ms);
}

/**
 * Ticking clock. `serverNow` (epoch ms reported by the backend) corrects for a skewed device clock.
 */
export function useNow(intervalMs = 1000, serverNow?: number): number {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (serverNow) setOffset(serverNow - Date.now());
  }, [serverNow]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now + offset;
}
