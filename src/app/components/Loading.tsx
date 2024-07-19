"use client";

import React from "react";

// Loading Page
export default function Loading() {
  return (
    <main className="flex flex-col md:flex-row">
      <div className="flex h-screen w-full animate-spin items-center justify-center text-2xl">
        <h1>
          <svg viewBox="0 0 24 24" fill="currentColor" height="3em" width="3em" className="m-auto">
            <path d="M12 4V2A10 10 0 002 12h2a8 8 0 018-8z" />
          </svg>
        </h1>
      </div>
    </main>
  );
}
