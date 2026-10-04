"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { adminApi, adminKeys, useAdminMutation, useSettings } from "@/src/app/admin/api";
import { ErrorState, LoadingBlock, PageHeader, Panel, Switch } from "@/src/app/admin/components/ui";
import type { Settings } from "@/src/app/admin/types";
import { api, errorMessage } from "@/src/app/lib/api";

/** Blob errors come back as Blobs too; read the plain-text message out of them. */
async function blobErrorMessage(err: unknown): Promise<string> {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      if (text.trim()) return text;
    } catch {}
  }
  return errorMessage(err);
}

function filenameFrom(disposition: string | undefined): string {
  const match = disposition && /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  if (match) return decodeURIComponent(match[1]);
  const stamp = new Date().toISOString().slice(0, 10);
  return `jersey-allocations-${stamp}.csv`;
}

export default function SettingsPage() {
  const { data, error, isLoading, refetch } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const update = useAdminMutation(adminApi.patchSettings, {
    success: s => (s.allowLogin ? "Resident login enabled" : "Resident login disabled"),
    onData: s => queryClient.setQueryData<Settings>(adminKeys.settings, s),
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get("/admin/export/allocations", { responseType: "blob" });
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFrom(res.headers["content-disposition"]);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast({ variant: "destructive", title: "Export failed", description: await blobErrorMessage(err) });
    } finally {
      setExporting(false);
    }
  };

  const allowLogin = update.isPending ? !!update.variables?.allowLogin : !!data?.allowLogin;

  return (
    <>
      <PageHeader title="Settings" description="Site access and data export." />
      <div className="space-y-4">
        <Panel title="Access">
          {isLoading ? (
            <LoadingBlock rows={1} />
          ) : error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <label htmlFor="allow-login" className="font-medium text-white">
                  Allow resident login
                </label>
                <p className="mt-0.5 text-sm text-silver">
                  When off, only admins can sign in. Use this to close the site outside bidding.
                </p>
              </div>
              <Switch
                id="allow-login"
                label="Allow resident login"
                checked={allowLogin}
                disabled={update.isPending}
                onCheckedChange={v => update.mutate({ allowLogin: v })}
              />
            </div>
          )}
        </Panel>

        <Panel
          title="Export"
          description="Name, matric, room, gender, round, points, number and the round it was allocated in."
        >
          <Button variant="outline" onClick={exportCsv} disabled={exporting}>
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {exporting ? "Preparing" : "Export allocations CSV"}
          </Button>
        </Panel>
      </div>
    </>
  );
}
