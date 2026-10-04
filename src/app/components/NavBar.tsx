"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { LogOut, Shield, Shirt, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { Wordmark } from "@/src/app/components/Brand";
import { useLogout } from "@/src/app/lib/useLogout";
import { selectUser } from "@/src/app/redux/Resources/userSlice";

/**
 * Resident navigation: a slim top bar everywhere, plus a fixed bottom tab bar on phones so the
 * primary destinations sit under the thumb.
 */
export default function NavBar() {
  const pathname = usePathname();
  const user = useSelector(selectUser);
  const logout = useLogout();
  // The redux user is restored from localStorage, so only read it after mount to avoid hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const links = [
    { href: "/dashboard/jersey", label: "Jersey", icon: Shirt },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
    ...(mounted && user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link
            href="/dashboard/jersey"
            className="-ml-1 rounded-md px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-md px-3 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua",
                    active ? "text-white" : "text-silver hover:text-white",
                  )}
                >
                  {label}
                  {active && <span aria-hidden className="absolute inset-x-3 -bottom-[11px] h-px bg-biolum" />}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-md px-3 text-[13px] text-silver transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua md:ml-2"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Sign out
          </button>
        </div>
      </header>

      {/* Phone tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-recessed/95 backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch px-2 pb-safe">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-[0.04em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua",
                    active ? "text-white" : "text-[#93a19f] hover:text-silver",
                  )}
                >
                  {active && <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-biolum" />}
                  <Icon className={cn("h-[22px] w-[22px]", active && "text-aqua")} strokeWidth={1.5} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
