"use client";

import React from "react";

// Loading Page
export default function Loading() {
  return (
    <div className="flex min-h-full w-full flex-wrap content-center justify-center">
      <div className="border-primary rounded-md border bg-white p-4">
        <div className="flex">
          <div className="mr-4 h-16 w-16 animate-pulse rounded border border-gray-200 bg-gray-200"></div>
          <div className="flex w-full flex-col space-y-1">
            <div className="flex w-full items-center">
              <div className="h-5 w-60 animate-pulse border border-gray-200 bg-gray-200"></div>
              <div className="bg-ternary ml-4 h-5 w-12 animate-pulse"></div>
            </div>
            <div className="h-5 w-36 animate-pulse border border-gray-200 bg-gray-200"></div>
            <div className="h-44 w-full animate-pulse border border-gray-200 bg-gray-200"></div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 animate-pulse border border-gray-200 bg-gray-200"></div>
            <span className="bg-tertiary h-1 w-1 animate-pulse rounded"></span>
            <div className="h-5 w-16 animate-pulse border border-gray-200 bg-gray-200"></div>
          </div>
          <div className="h-5 w-16 animate-pulse border border-gray-200 bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
