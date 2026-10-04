"use client";

import React, { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { store } from "@/src/app/redux/store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Keep one client for the app's lifetime so cached queries/intervals survive re-renders
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );
}
