import React from "react";

import NavBar from "@/src/app/components/NavBar";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="lg:grid lg:grid-cols-6">
      <div className="lg:flex">
        <NavBar />
      </div>
      <div className="lg:col-span-5">{children}</div>
    </section>
  );
}
