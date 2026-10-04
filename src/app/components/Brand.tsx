import React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";

/** Hall crest + tracked wordmark. The crest sits on its own light tile because the artwork has a white field. */
export function Wordmark({ className, crest = true }: { className?: string; crest?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {crest && (
        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#fffdfa] outline outline-1 -outline-offset-1 outline-ink/10">
          <Image src="/eusoff-logo.png" alt="" width={22} height={25} className="h-[22px] w-auto" priority />
        </span>
      )}
      <span className="text-[13px] font-medium uppercase leading-none tracking-[0.22em] text-heading">Eusoff Hall</span>
    </span>
  );
}
