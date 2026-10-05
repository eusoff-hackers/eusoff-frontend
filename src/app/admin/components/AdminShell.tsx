"use client";

import React, { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
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

import { Wordmark } from "@/src/app/components/Brand";
import ThemeToggle from "@/src/app/components/ThemeToggle";
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
  return (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                linkBase,
                "relative",
                active ? "bg-ink/[0.06] text-heading" : "text-silver hover:bg-ink/[0.04] hover:text-heading",
              )}
            >
              {active && <span aria-hidden className="absolute inset-y-2.5 left-0 w-px bg-biolum" />}
              <Icon className={cn("h-[18px] w-[18px]", active && "text-aqua")} strokeWidth={1.5} aria-hidden />
              <span className="flex-1">{label}</span>
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
    <div className="flex h-full flex-col bg-raised px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-5">
      <div className="mb-5 rounded-xl bg-brand px-3 py-3.5 [box-shadow:var(--card-shadow)]">
        <Wordmark />
        <p className="mt-2 text-[13px] font-medium text-band-ink">Jersey admin</p>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </nav>
      <div className="mt-4 space-y-0.5 border-t border-hairline pt-3">
        <div className="flex items-center justify-between gap-2 pb-1 pl-3">
          <span className="text-[13px] text-silver">Theme</span>
          <ThemeToggle />
        </div>
        {user && (
          <p className="truncate px-3 pb-2 text-xs text-faint">Signed in as {user.name ?? user.username}</p>
        )}
        <Link
          href="/dashboard/jersey"
          onClick={onNavigate}
          className={cn(linkBase, "text-silver hover:bg-ink/[0.04] hover:text-heading")}
        >
          <Shirt className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden /> Resident view
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(linkBase, "w-full text-silver hover:bg-ink/[0.04] hover:text-heading")}
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
      <header className="sticky top-0 z-30 bg-brand pt-[env(safe-area-inset-top)] [box-shadow:0_1px_0_rgb(var(--ink)/0.08)] lg:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Wordmark crest />
          <span className="ml-1 text-[13px] font-medium text-band-ink">Admin</span>
          <ThemeToggle className="-mr-1 ml-auto" />
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
                    active ? "text-heading" : "text-faint hover:text-silver",
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
                !inTabs ? "text-heading" : "text-faint hover:text-silver",
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
