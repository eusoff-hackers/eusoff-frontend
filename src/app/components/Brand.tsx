import React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";

/** Hall crest + wordmark, set on the Eusoff gradient band (ink adapts per theme). */
export function Wordmark({ className, crest = true }: { className?: string; crest?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {crest && (
        <Image src="/eusoff-logo.png" alt="" width={480} height={553} className="h-8 w-auto shrink-0" priority />
      )}
      <span className="text-[17px] font-bold leading-none tracking-[-0.01em] text-band-ink">Eusoff Hall</span>
    </span>
  );
}
