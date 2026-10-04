import React from "react";

import NavBar from "@/src/app/components/NavBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh]">
      <NavBar />
      {/* Bottom padding clears the phone tab bar (4rem + safe area). */}
      <main className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-16">{children}</main>
    </div>
  );
}
