"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

import { setTheme, useTheme } from "@/src/app/lib/theme";

/**
 * Tactile light/dark switch: a pill track with a thumb that springs across, the icon inside the
 * thumb morphs (rotate + scale + blur cross-fade), and the whole control dips on press.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // keyboard activation reports 0,0: reveal from the control's centre instead
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;
    setTheme(dark ? "light" : "dark", { x, y });
  };

  const icon =
    "absolute inset-0 m-auto h-[14px] w-[14px] transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Dark mode"
      aria-pressed={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative inline-flex h-10 w-[60px] shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out focus-visible:outline-none active:scale-[0.94]",
        className,
      )}
    >
      {/* track */}
      <span
        aria-hidden
        className={cn(
          "relative block h-[30px] w-[54px] rounded-full border transition-colors duration-300",
          "group-focus-visible:ring-2 group-focus-visible:ring-aqua group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-canvas",
          dark ? "border-ink/15 bg-ink/[0.08]" : "border-ink/[0.12] bg-ink/[0.06]",
        )}
      >
        {/* faint glyphs on the track show where the thumb will go */}
        <Sun
          className={cn(
            "absolute left-[8px] top-1/2 h-3 w-3 -translate-y-1/2 text-faint transition-opacity duration-300",
            dark ? "opacity-60" : "opacity-0",
          )}
          strokeWidth={1.75}
        />
        <Moon
          className={cn(
            "absolute right-[8px] top-1/2 h-3 w-3 -translate-y-1/2 text-faint transition-opacity duration-300",
            dark ? "opacity-0" : "opacity-60",
          )}
          strokeWidth={1.75}
        />
        {/* thumb */}
        <span
          className={cn(
            "absolute left-[2px] top-[2px] h-6 w-6 rounded-full transition-[transform,background-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.34,1.45,0.64,1)] group-active:w-7",
            "shadow-[0_1px_2px_rgb(1_38_36/0.18),0_2px_6px_rgb(1_38_36/0.12)]",
            dark ? "translate-x-[24px] bg-mist group-active:translate-x-[20px]" : "translate-x-0 bg-raised",
          )}
        >
          <Sun
            className={cn(
              icon,
              "text-[#b8741c]",
              dark ? "rotate-90 scale-[0.25] opacity-0 blur-[4px]" : "rotate-0 scale-100 opacity-100 blur-0",
            )}
            strokeWidth={2}
          />
          <Moon
            className={cn(
              icon,
              "text-canvas",
              dark ? "rotate-0 scale-100 opacity-100 blur-0" : "-rotate-90 scale-[0.25] opacity-0 blur-[4px]",
            )}
            strokeWidth={2}
          />
        </span>
      </span>
    </button>
  );
}
