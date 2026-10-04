"use client";

import React, { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CalendarClock,
  Hash,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Settings,
  Shirt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { useOverview } from "@/src/app/admin/api";
import { api, apiGet, toUser } from "@/src/app/lib/api";
import { removeUser, selectUser, setUser } from "@/src/app/redux/Resources/userSlice";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/residents", label: "Residents", icon: Users },
  { href: "/admin/rounds", label: "Rounds", icon: CalendarClock },
  { href: "/admin/numbers", label: "Numbers", icon: Hash },
  { href: "/admin/bids", label: "Bids", icon: ListOrdered },
  { href: "/admin/issues", label: "Data issues", icon: AlertTriangle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: overview } = useOverview();
  return (
    <ul className="space-y-1">
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
                "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
                active && "bg-white/10 text-white",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-amber-300")} aria-hidden />
              <span className="flex-1">{label}</span>
              {!!count && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-emerald-950">
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
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
    dispatch(removeUser());
    localStorage.clear();
    try {
      await api.post("/user/logout");
    } catch {
      console.error("Logout error");
    }
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-emerald-950 p-3 text-white">
      <div className="mb-4 px-3 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Eusoff Hall</p>
        <p className="text-lg font-semibold">Jersey Admin</p>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </nav>
      <div className="mt-4 space-y-1 border-t border-white/10 pt-3">
        {user && (
          <p className="truncate px-3 pb-1 text-xs text-emerald-50/60">Signed in as {user.name ?? user.username}</p>
        )}
        <Link
          href="/dashboard/jersey"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm text-emerald-50/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <Shirt className="h-5 w-5" aria-hidden /> Resident view
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 text-sm text-emerald-50/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <LogOut className="h-5 w-5" aria-hidden /> Log out
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const allowed = useAdminGuard();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const current = NAV.find(n => isActive(pathname, n.href));

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">
        <SidebarBody />
      </aside>

      {/* Phone/tablet top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-emerald-950 px-2 text-white shadow lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
        <p className="truncate font-semibold">
          <span className="text-amber-300">Jersey Admin</span>
          {current && <span className="text-emerald-50/80"> · {current.label}</span>}
        </p>
      </header>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0 text-white [&>button]:text-white">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:ml-60 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
