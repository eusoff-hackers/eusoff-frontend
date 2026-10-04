"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { adminApi, adminKeys, useAdminMutation, useIssues } from "@/src/app/admin/api";
import { EmptyState, ErrorState, LoadingBlock, PageHeader, Segmented } from "@/src/app/admin/components/ui";
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

      <Segmented
        className="mb-4"
        label="Filter issues"
        value={view}
        onChange={setView}
        options={[
          { value: "open", label: "Unresolved", count: counts.open },
          { value: "resolved", label: "Resolved", count: counts.resolved },
          { value: "all", label: "All", count: counts.all },
        ]}
      />

      {isLoading ? (
        <LoadingBlock rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : groups.length === 0 ? (
        <EmptyState>{view === "open" ? "No unresolved issues." : "Nothing to show."}</EmptyState>
      ) : (
        <div className="space-y-4">
          {groups.map(([category, items]) => (
            <section key={category} className="surface-card overflow-hidden">
              <h2 className="flex items-center justify-between gap-3 border-b border-hairline bg-recessed/60 px-4 py-3 text-[15px] font-medium sm:px-5">
                <span className="min-w-0 break-words">{category}</span>
                <span className="shrink-0 rounded-[5px] bg-white/[0.07] px-2 py-0.5 text-xs font-medium tabular-nums text-mist">
                  {items.length}
                </span>
              </h2>
              <ul>
                {items.map(issue => {
                  const checked = pendingId === issue._id ? !!pendingValue : issue.resolved;
                  return (
                    <li key={issue._id} className="border-b border-hairline last:border-0">
                      <label className="flex min-h-[48px] cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#5eead4]"
                          checked={checked}
                          disabled={pendingId === issue._id}
                          onChange={e => setResolved.mutate({ id: issue._id, resolved: e.target.checked })}
                        />
                        <span
                          className={cn("min-w-0 break-words text-sm text-mist", checked && "text-[#93a19f] line-through")}
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
