"use client";

import React, { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Hash,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MoreHorizontal,
  Settings,
  Shirt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { useOverview } from "@/src/app/admin/api";
import { Wordmark } from "@/src/app/components/Brand";
import { apiGet, toUser } from "@/src/app/lib/api";
import { useLogout } from "@/src/app/lib/useLogout";
import { selectUser, setUser } from "@/src/app/redux/Resources/userSlice";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/residents", label: "Residents", icon: Users },
  { href: "/admin/rounds", label: "Rounds", icon: CalendarClock },
  { href: "/admin/numbers", label: "Numbers", icon: Hash },
  { href: "/admin/bids", label: "Bids", icon: ListOrdered },
  { href: "/admin/issues", label: "Data issues", icon: AlertTriangle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/** Thumb bar on phones: the four most-used destinations plus "More". */
const TAB_HREFS = ["/admin", "/admin/residents", "/admin/rounds", "/admin/analytics"];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/** Client-side guard: only ADMIN sessions get past. Re-checks with the server when redux is missing/not admin. */
function useAdminGuard() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      setAllowed(true);
      return;
    }
    let cancelled = false;
    apiGet<{ user: Record<string, unknown> }>("/user/info")
      .then(({ user: fresh }) => {
        if (cancelled) return;
        if (fresh?.role === "ADMIN") {
          dispatch(setUser(toUser(fresh)));
          setAllowed(true);
        } else {
          router.replace("/");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/");
      });
    return () => {
      cancelled = true;
    };
  }, [user, dispatch, router]);

  return allowed;
}

const linkBase =
  "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: overview } = useOverview();
  return (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        const count = href === "/admin/issues" ? overview?.issuesOpen : undefined;
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                linkBase,
                "relative",
                active ? "bg-white/[0.06] text-white" : "text-silver hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {active && <span aria-hidden className="absolute inset-y-2.5 left-0 w-px bg-biolum" />}
              <Icon className={cn("h-[18px] w-[18px]", active && "text-aqua")} strokeWidth={1.5} aria-hidden />
              <span className="flex-1">{label}</span>
              {!!count && (
                <span className="rounded-[5px] bg-warn/10 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-warn">
                  {count}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const user = useSelector(selectUser);
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col bg-recessed px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-5">
      <div className="mb-6 px-3">
        <Wordmark />
        <p className="eyebrow mt-4 text-aqua/90">Jersey admin</p>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </nav>
      <div className="mt-4 space-y-0.5 border-t border-hairline pt-3">
        {user && (
          <p className="truncate px-3 pb-2 text-xs text-[#93a19f]">Signed in as {user.name ?? user.username}</p>
        )}
        <Link
          href="/dashboard/jersey"
          onClick={onNavigate}
          className={cn(linkBase, "text-silver hover:bg-white/[0.04] hover:text-white")}
        >
          <Shirt className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden /> Resident view
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(linkBase, "w-full text-silver hover:bg-white/[0.04] hover:text-white")}
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const allowed = useAdminGuard();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const inTabs = TAB_HREFS.some(h => isActive(pathname, h));

  if (!allowed) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-silver" aria-busy="true">
        Checking access
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-hairline lg:block">
        <SidebarBody />
      </aside>

      {/* Phone/tablet top bar */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Wordmark crest />
          <span className="eyebrow ml-auto text-aqua/90">Admin</span>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[86%] max-w-[300px] gap-0 border-0 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="min-w-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:ml-60 lg:px-10 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Phone/tablet tab bar */}
      <nav
        aria-label="Admin shortcuts"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-recessed/95 backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch px-1 pb-safe">
          {NAV.filter(n => TAB_HREFS.includes(n.href)).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="min-w-0 flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua",
                    active ? "text-white" : "text-[#93a19f] hover:text-silver",
                  )}
                >
                  {active && <span aria-hidden className="absolute inset-x-4 top-0 h-px bg-biolum" />}
                  <Icon className={cn("h-[22px] w-[22px]", active && "text-aqua")} strokeWidth={1.5} aria-hidden />
                  <span className="max-w-full truncate px-1">{label}</span>
                </Link>
              </li>
            );
          })}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="More admin pages"
              className={cn(
                "relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua",
                !inTabs ? "text-white" : "text-[#93a19f] hover:text-silver",
              )}
            >
              {!inTabs && <span aria-hidden className="absolute inset-x-4 top-0 h-px bg-biolum" />}
              <MoreHorizontal className={cn("h-[22px] w-[22px]", !inTabs && "text-aqua")} strokeWidth={1.5} aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
