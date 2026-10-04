"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { adminApi, adminKeys, useAdminMutation, useIssues } from "@/src/app/admin/api";
import { EmptyState, ErrorState, LoadingBlock, PageHeader } from "@/src/app/admin/components/ui";
import type { Issue } from "@/src/app/admin/types";

type View = "open" | "resolved" | "all";

export default function IssuesPage() {
  const { data: issues, error, isLoading, refetch } = useIssues();
  const [view, setView] = useState<View>("open");
  const queryClient = useQueryClient();

  const setResolved = useAdminMutation(adminApi.patchIssue, {
    onData: updated =>
      queryClient.setQueryData<Issue[]>(adminKeys.issues, list =>
        list?.map(i => (i._id === updated._id ? updated : i)),
      ),
  });

  const counts = useMemo(() => {
    const open = (issues ?? []).filter(i => !i.resolved).length;
    return { open, resolved: (issues?.length ?? 0) - open, all: issues?.length ?? 0 };
  }, [issues]);

  const groups = useMemo(() => {
    const visible = (issues ?? []).filter(i => view === "all" || (view === "open" ? !i.resolved : i.resolved));
    const map = new Map<string, Issue[]>();
    for (const i of visible) map.set(i.category, [...(map.get(i.category) ?? []), i]);
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [issues, view]);

  // Optimistic: show the pending value while the PATCH is in flight
  const pendingId = setResolved.isPending ? setResolved.variables?.id : undefined;
  const pendingValue = setResolved.variables?.resolved;

  return (
    <>
      <PageHeader
        title="Data issues"
        description="Problems found while importing resident, team and points data. Tick an issue once it's sorted."
      />

      <div className="mb-4 inline-flex rounded-md border bg-card p-0.5 shadow-sm" role="tablist" aria-label="Filter">
        {(["open", "resolved", "all"] as View[]).map(v => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={cn(
              "h-10 rounded px-3 text-sm font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              view === v ? "bg-emerald-950 text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "open" ? "Unresolved" : v} <span className="tabular-nums opacity-70">({counts[v]})</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingBlock rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : groups.length === 0 ? (
        <EmptyState>{view === "open" ? "No unresolved issues." : "Nothing to show."}</EmptyState>
      ) : (
        <div className="space-y-4">
          {groups.map(([category, items]) => (
            <section key={category} className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <h2 className="flex items-center justify-between gap-2 border-b bg-slate-50 px-4 py-2.5 text-sm font-semibold">
                <span className="min-w-0 break-words">{category}</span>
                <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs tabular-nums">
                  {items.length}
                </span>
              </h2>
              <ul className="divide-y">
                {items.map(issue => {
                  const checked = pendingId === issue._id ? !!pendingValue : issue.resolved;
                  return (
                    <li key={issue._id}>
                      <label className="flex min-h-[48px] cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-700"
                          checked={checked}
                          disabled={pendingId === issue._id}
                          onChange={e => setResolved.mutate({ id: issue._id, resolved: e.target.checked })}
                        />
                        <span
                          className={cn("min-w-0 break-words text-sm", checked && "text-muted-foreground line-through")}
                        >
                          {issue.detail}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
