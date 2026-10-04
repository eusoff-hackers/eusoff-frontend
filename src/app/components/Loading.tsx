"use client";

import React from "react";

import { Skeleton } from "@/src/app/components/system";

/** Page-shaped skeleton for the resident area. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6 sm:px-6 sm:py-10" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-10 w-72 max-w-full" />
      <div className="grid gap-4 md:grid-cols-[1.1fr,1fr]">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
