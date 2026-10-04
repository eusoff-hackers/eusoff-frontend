import React from "react";

import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";

import "@/src/app/globals.css";
import { Providers } from "@/src/app/redux/provider";

/**
 * Inter Tight stands in for the proprietary Matter: tight grotesque metrics that hold up at display sizes
 * with negative tracking, and true tabular figures for the number grid, countdowns and admin tables.
 */
const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jersey Bidding 26/27 · Eusoff Hall",
  description: "Bid for your Eusoff Hall IHG jersey number.",
  themeColor: "#012624",
  viewport: { width: "device-width", initialScale: 1, viewportFit: "cover" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
