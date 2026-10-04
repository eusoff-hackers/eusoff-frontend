import React from "react";

import type { Metadata } from "next";

import AdminShell from "@/src/app/admin/components/AdminShell";

export const metadata: Metadata = {
  title: "Jersey Admin · Eusoff Hall",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
