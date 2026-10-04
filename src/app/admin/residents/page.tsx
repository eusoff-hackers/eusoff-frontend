"use client";

import React, { useDeferredValue, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Search } from "lucide-react";

import { useAdminUsers } from "@/src/app/admin/api";
import {
  EmptyState,
  ErrorState,
  GenderTag,
  LoadingBlock,
  NumberChip,
  PageHeader,
  Select,
} from "@/src/app/admin/components/ui";
import ResidentDrawer from "@/src/app/admin/residents/ResidentDrawer";
import type { AdminUser } from "@/src/app/admin/types";

type Tri = "all" | "yes" | "no";
type SortKey = "points" | "room" | "name";

const roomCmp = (a: string, b: string) => (a ?? "").localeCompare(b ?? "", undefined, { numeric: true });

export default function ResidentsPage() {
  const { data: users, error, isLoading, refetch } = useAdminUsers();
  const [query, setQuery] = useState("");
  const [round, setRound] = useState("all");
  const [gender, setGender] = useState("all");
  const [allocated, setAllocated] = useState<Tri>("all");
  const [hasBids, setHasBids] = useState<Tri>("all");
  const [sort, setSort] = useState<SortKey>("points");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!users) return [];
    const match = (flag: Tri, v: boolean) => flag === "all" || (flag === "yes") === v;
    const list = users.filter(
      u =>
        (round === "all" || String(u.round) === round) &&
        (gender === "all" || u.gender === gender) &&
        match(allocated, u.isAllocated) &&
        match(hasBids, u.bids.length > 0) &&
        (!q ||
          u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.room?.toLowerCase().includes(q)),
    );
    const sorters: Record<SortKey, (a: AdminUser, b: AdminUser) => number> = {
      points: (a, b) => b.points - a.points || a.round - b.round || a.name.localeCompare(b.name),
      room: (a, b) => roomCmp(a.room, b.room),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(sorters[sort]);
  }, [users, q, round, gender, allocated, hasBids, sort]);

  const selected = users?.find(u => u._id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        title="Residents"
        description={users ? `${filtered.length} of ${users.length} residents` : "Everyone eligible to bid"}
      />

      <div className="mb-4 space-y-3 rounded-lg border bg-card p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, matric or room"
            aria-label="Search residents"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <Label htmlFor="f-round" className="text-xs text-muted-foreground">
              Round
            </Label>
            <Select id="f-round" value={round} onChange={e => setRound(e.target.value)}>
              <option value="all">All rounds</option>
              {[1, 2, 3, 4].map(r => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-gender" className="text-xs text-muted-foreground">
              Gender
            </Label>
            <Select id="f-gender" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="f-alloc" className="text-xs text-muted-foreground">
              Number
            </Label>
            <Select id="f-alloc" value={allocated} onChange={e => setAllocated(e.target.value as Tri)}>
              <option value="all">Any</option>
              <option value="yes">Allocated</option>
              <option value="no">Not allocated</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="f-bids" className="text-xs text-muted-foreground">
              Bids
            </Label>
            <Select id="f-bids" value={hasBids} onChange={e => setHasBids(e.target.value as Tri)}>
              <option value="all">Any</option>
              <option value="yes">Has bids</option>
              <option value="no">No bids</option>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="f-sort" className="text-xs text-muted-foreground">
              Sort by
            </Label>
            <Select id="f-sort" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
              <option value="points">Points (high → low)</option>
              <option value="room">Room</option>
              <option value="name">Name</option>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingBlock rows={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState>No residents match these filters.</EmptyState>
      ) : (
        <>
          {/* Phones: stacked cards */}
          <ul className="space-y-2 md:hidden">
            {filtered.map(u => (
              <li key={u._id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(u._id)}
                  className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>{u.username}</span>
                      <span>· {u.room}</span>
                      <GenderTag gender={u.gender} />
                      <span>R{u.round}</span>
                      <span className="font-semibold text-foreground">{u.points} pts</span>
                    </p>
                  </div>
                  <NumberChip n={u.jersey} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: table */}
          <div className="hidden overflow-hidden rounded-lg border bg-card shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-3 py-3 font-medium">Room</th>
                  <th className="px-3 py-3 font-medium">Gender</th>
                  <th className="px-3 py-3 font-medium">Round</th>
                  <th className="px-3 py-3 text-right font-medium">Points</th>
                  <th className="px-3 py-3 text-right font-medium">Bids</th>
                  <th className="px-4 py-3 text-right font-medium">Number</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(u => (
                  <tr key={u._id} onClick={() => setSelectedId(u._id)} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedId(u._id);
                        }}
                        className="block rounded text-left font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {u.name}
                      </button>
                      <span className="block text-xs text-muted-foreground">{u.username}</span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{u.room}</td>
                    <td className="px-3 py-2.5">
                      <GenderTag gender={u.gender} />
                    </td>
                    <td className="px-3 py-2.5">{u.round}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{u.points}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{u.bids.length}</td>
                    <td className="px-4 py-2.5 text-right">
                      <NumberChip n={u.jersey} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ResidentDrawer user={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}
