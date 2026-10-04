"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { LogOut, Shield, Shirt, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { api } from "@/src/app/lib/api";
import { removeUser, selectUser } from "@/src/app/redux/Resources/userSlice";

export default function NavBar() {
  const route = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  // The redux user is restored from localStorage, so only read it after mount to avoid hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const logout = async (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(removeUser());
    localStorage.clear();
    try {
      await api.post("/user/logout");
    } catch (error) {
      console.error("Logout error");
    }
    route.push("/");
  };

  const links = [
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
    { href: "/dashboard/jersey", label: "Jersey", icon: Shirt },
    ...(mounted && user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const itemClass =
    "flex min-h-[40px] items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 lg:gap-3 lg:text-base";

  return (
    <nav aria-label="Dashboard" className="w-full bg-emerald-950 px-3 py-2 text-white lg:min-h-screen lg:p-5">
      <p className="hidden text-2xl font-semibold lg:mb-5 lg:block">Dashboard</p>
      <ul className="flex flex-wrap items-center gap-1 lg:flex-col lg:items-stretch lg:space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(itemClass, pathname === href && "bg-white/10 text-amber-200")}
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden />
              <span>{label}</span>
            </Link>
          </li>
        ))}
        <li className="ml-auto lg:ml-0">
          <a href="/" onClick={logout} className={itemClass}>
            <LogOut className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden />
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
