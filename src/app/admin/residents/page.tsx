"use client";

import React, { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";

import { useAdminUsers } from "@/src/app/admin/api";
import {
  Callout,
  EmptyState,
  ErrorState,
  GenderTag,
  LoadingBlock,
  NeverBadge,
  NumberChip,
  PageHeader,
  Select,
} from "@/src/app/admin/components/ui";
import ResidentDrawer from "@/src/app/admin/residents/ResidentDrawer";
import type { AdminUser } from "@/src/app/admin/types";
import { formatLastSeen, useNow } from "@/src/app/lib/time";

type Tri = "all" | "yes" | "no";
type SortKey = "points" | "room" | "name" | "login";

const roomCmp = (a: string, b: string) => (a ?? "").localeCompare(b ?? "", undefined, { numeric: true });

export default function ResidentsPage() {
  const { data: users, error, isLoading, refetch } = useAdminUsers();
  const now = useNow(60_000);
  const [query, setQuery] = useState("");
  const [round, setRound] = useState("all");
  const [gender, setGender] = useState("all");
  const [allocated, setAllocated] = useState<Tri>("all");
  const [hasBids, setHasBids] = useState<Tri>("all");
  const [login, setLogin] = useState<"all" | "never" | "yes">("all");
  const [sort, setSort] = useState<SortKey>("points");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const unknownGender = useMemo(() => (users ?? []).filter(u => !u.gender).length, [users]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const match = (flag: Tri, v: boolean) => flag === "all" || (flag === "yes") === v;
    const list = users.filter(
      u =>
        (round === "all" || String(u.round) === round) &&
        (gender === "all" || (gender === "unknown" ? !u.gender : u.gender === gender)) &&
        match(allocated, u.isAllocated) &&
        match(hasBids, u.bids.length > 0) &&
        (login === "all" || (login === "never" ? u.lastLogin == null : u.lastLogin != null)) &&
        (!q ||
          u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.room?.toLowerCase().includes(q)),
    );
    const sorters: Record<SortKey, (a: AdminUser, b: AdminUser) => number> = {
      points: (a, b) => b.points - a.points || a.round - b.round || a.name.localeCompare(b.name),
      room: (a, b) => roomCmp(a.room, b.room),
      name: (a, b) => a.name.localeCompare(b.name),
      login: (a, b) => (b.lastLogin ?? -1) - (a.lastLogin ?? -1),
    };
    return list.sort(sorters[sort]);
  }, [users, q, round, gender, allocated, hasBids, login, sort]);

  const selected = users?.find(u => u._id === selectedId) ?? null;
  const filtersOn =
    round !== "all" || gender !== "all" || allocated !== "all" || hasBids !== "all" || login !== "all" || q !== "";
  const reset = () => {
    setQuery("");
    setRound("all");
    setGender("all");
    setAllocated("all");
    setHasBids("all");
    setLogin("all");
  };

  return (
    <>
      <PageHeader
        title="Residents"
        description={
          users ? (
            <>
              <span className="tabular-nums text-mist">{filtered.length}</span> of {users.length} residents
            </>
          ) : (
            "Everyone eligible to bid"
          )
        }
      />

      {unknownGender > 0 && gender !== "unknown" && (
        <Callout tone="warn" icon={AlertTriangle} className="mb-4 items-center">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              <span className="font-medium text-white">
                {unknownGender} resident{unknownGender === 1 ? " has" : "s have"} no gender on record
              </span>{" "}
              and can&apos;t bid until it&apos;s set.
            </p>
            <Button size="sm" variant="outline" onClick={() => setGender("unknown")}>
              Show them
            </Button>
          </div>
        </Callout>
      )}

      <div className="surface-card mb-4 space-y-3 p-3 sm:p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, matric or room"
            aria-label="Search residents"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              id: "f-round",
              label: "Round",
              value: round,
              set: setRound,
              options: [["all", "All rounds"], ...[1, 2, 3, 4].map(r => [String(r), `Round ${r}`])],
            },
            {
              id: "f-gender",
              label: "Gender",
              value: gender,
              set: setGender,
              options: [
                ["all", "All"],
                ["male", "Male"],
                ["female", "Female"],
                ["unknown", `Unknown (${unknownGender})`],
              ],
            },
            {
              id: "f-alloc",
              label: "Number",
              value: allocated,
              set: (v: string) => setAllocated(v as Tri),
              options: [
                ["all", "Any"],
                ["yes", "Allocated"],
                ["no", "Not allocated"],
              ],
            },
            {
              id: "f-bids",
              label: "Bids",
              value: hasBids,
              set: (v: string) => setHasBids(v as Tri),
              options: [
                ["all", "Any"],
                ["yes", "Has bids"],
                ["no", "No bids"],
              ],
            },
            {
              id: "f-login",
              label: "Login",
              value: login,
              set: (v: string) => setLogin(v as typeof login),
              options: [
                ["all", "Any"],
                ["yes", "Has logged in"],
                ["never", "Never logged in"],
              ],
            },
            {
              id: "f-sort",
              label: "Sort by",
              value: sort,
              set: (v: string) => setSort(v as SortKey),
              options: [
                ["points", "Points"],
                ["room", "Room"],
                ["name", "Name"],
                ["login", "Last login"],
              ],
            },
          ].map(f => (
            <div key={f.id} className="min-w-0 space-y-1.5">
              <Label htmlFor={f.id} className="text-xs">
                {f.label}
              </Label>
              <Select id={f.id} value={f.value} onChange={e => f.set(e.target.value)}>
                {f.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
        {filtersOn && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingBlock rows={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState>No residents match these filters.</EmptyState>
      ) : (
        <>
          {/* Phones: stacked rows */}
          <ul className="surface-card overflow-hidden md:hidden">
            {filtered.map(u => (
              <li key={u._id} className="border-b border-hairline last:border-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(u._id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-white">{u.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-silver">
                      <span className="tabular-nums">{u.room}</span>
                      <GenderTag gender={u.gender} />
                      <span>R{u.round}</span>
                      <span className="tabular-nums text-mist">{u.points} pts</span>
                      {u.lastLogin == null && <NeverBadge />}
                    </p>
                  </div>
                  <NumberChip n={u.jersey} highlight={u.jersey != null} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#93a19f]" strokeWidth={1.5} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: table */}
          <div className="surface-card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead className="border-b border-hairline bg-recessed/60 text-left">
                  <tr className="[&>th]:h-10 [&>th]:whitespace-nowrap [&>th]:px-3 [&>th]:text-[11px] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.12em] [&>th]:text-silver">
                    <th className="!pl-5">Resident</th>
                    <th>Room</th>
                    <th>Gender</th>
                    <th>Round</th>
                    <th className="text-right">Points</th>
                    <th className="text-right">Bids</th>
                    <th>Last login</th>
                    <th className="!pr-5 text-right">Number</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr
                      key={u._id}
                      onClick={() => setSelectedId(u._id)}
                      className="cursor-pointer border-b border-hairline transition-colors last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="max-w-[18rem] py-2.5 pl-5 pr-3">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedId(u._id);
                          }}
                          className="block max-w-full truncate rounded text-left text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
                        >
                          {u.name}
                        </button>
                        <span className="block text-xs text-[#93a19f]">{u.username}</span>
                      </td>
                      <td className="px-3 py-2.5 text-silver">{u.room}</td>
                      <td className="px-3 py-2.5">
                        <GenderTag gender={u.gender} />
                      </td>
                      <td className="px-3 py-2.5 text-silver">{u.round}</td>
                      <td className="px-3 py-2.5 text-right text-mist">{u.points}</td>
                      <td className="px-3 py-2.5 text-right text-silver">{u.bids.length}</td>
                      <td className={cn("whitespace-nowrap px-3 py-2.5 text-silver")}>
                        {u.lastLogin == null ? <NeverBadge /> : formatLastSeen(u.lastLogin, now)}
                      </td>
                      <td className="py-2.5 pl-3 pr-5 text-right">
                        <NumberChip n={u.jersey} highlight={u.jersey != null} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ResidentDrawer user={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}
