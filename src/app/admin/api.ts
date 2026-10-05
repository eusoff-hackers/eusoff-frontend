"use client";

import { useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import type {
  AdminJersey,
  Analytics,
  AssignPreview,
  AssignResult,
  NonBidder,
  AdminUser,
  AdminUserPatch,
  AllocationPreview,
  Overview,
  Round,
  RoundBids,
  Settings,
} from "@/src/app/admin/types";
import { apiGet, apiSend, errorMessage, errorStatus } from "@/src/app/lib/api";
import { removeUser } from "@/src/app/redux/Resources/userSlice";

export const adminKeys = {
  all: ["admin"] as const,
  overview: ["admin", "overview"] as const,
  users: ["admin", "users"] as const,
  rounds: ["admin", "rounds"] as const,
  jerseys: ["admin", "jerseys"] as const,
  bids: (round: number) => ["admin", "bids", round] as const,
  settings: ["admin", "settings"] as const,
  analytics: ["admin", "analytics"] as const,
  nonBidders: (round: number) => ["admin", "non-bidders", round] as const,
};

/** A 401 on any admin endpoint means the session is gone or no longer admin: send them to login. */
function useUnauthorisedRedirect(error: unknown) {
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    if (errorStatus(error) === 401) {
      dispatch(removeUser());
      router.replace("/");
    }
  }, [error, router, dispatch]);
}

function useAdminQuery<T>(queryKey: QueryKey, url: string, refetchInterval?: number) {
  const query = useQuery<T>({
    queryKey,
    queryFn: () => apiGet<T>(url),
    refetchInterval,
    retry: (count, err) => errorStatus(err) !== 401 && count < 2,
  });
  useUnauthorisedRedirect(query.error);
  return query;
}

export const useOverview = () => useAdminQuery<Overview>(adminKeys.overview, "/admin/overview", 15_000);
export const useAdminUsers = () => useAdminQuery<AdminUser[]>(adminKeys.users, "/admin/users");
export const useRounds = () => useAdminQuery<Round[]>(adminKeys.rounds, "/admin/rounds", 30_000);
export const useJerseys = () => useAdminQuery<AdminJersey[]>(adminKeys.jerseys, "/admin/jerseys", 30_000);
export const useRoundBids = (round: number) =>
  useAdminQuery<RoundBids[]>(adminKeys.bids(round), `/admin/bids?round=${round}`, 30_000);
export const useSettings = () => useAdminQuery<Settings>(adminKeys.settings, "/admin/settings");
export const useAnalytics = () => useAdminQuery<Analytics>(adminKeys.analytics, "/admin/analytics", 60_000);
export const useNonBidders = (round: number) =>
  useAdminQuery<NonBidder[]>(adminKeys.nonBidders(round), `/admin/rounds/${round}/non-bidders`, 60_000);

/**
 * Mutation that toasts on success/error and refreshes admin data.
 * `onData` lets callers patch caches immediately with the server's response.
 */
export function useAdminMutation<TVars, TData>(
  fn: (vars: TVars) => Promise<TData>,
  opts: { success?: string | ((data: TData) => string); onData?: (data: TData, vars: TVars) => void } = {},
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation<TData, unknown, TVars>({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      opts.onData?.(data, vars);
      if (opts.success) {
        toast({
          variant: "success",
          title: typeof opts.success === "function" ? opts.success(data) : opts.success,
        });
      }
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: err => {
      toast({ variant: "destructive", title: "Something went wrong", description: errorMessage(err) });
    },
  });
  useUnauthorisedRedirect(mutation.error);
  return mutation;
}

/** Replace one resident in the cached list with the server's fresh copy. */
export function useReplaceUser() {
  const queryClient = useQueryClient();
  return (user: AdminUser) =>
    queryClient.setQueryData<AdminUser[]>(adminKeys.users, list => list?.map(u => (u._id === user._id ? user : u)));
}

export const adminApi = {
  patchUser: ({ id, body }: { id: string; body: AdminUserPatch }) =>
    apiSend<AdminUser>("patch", `/admin/users/${id}`, body),
  resetPassword: (id: string) => apiSend<{ password: string }>("post", `/admin/users/${id}/password`),
  allocate: ({ id, number }: { id: string; number: number }) =>
    apiSend<AdminUser>("post", `/admin/users/${id}/allocate`, { number }),
  unallocate: (id: string) => apiSend<AdminUser>("delete", `/admin/users/${id}/allocate`),
  putRounds: (rounds: { round: number; open: number; close: number }[]) =>
    apiSend<Round[]>("put", "/admin/rounds", { rounds }),
  preview: (round: number) => apiSend<AllocationPreview>("post", `/admin/rounds/${round}/preview`),
  allocateRound: (round: number) => apiSend<Round>("post", `/admin/rounds/${round}/allocate`),
  undoRound: (round: number) => apiSend<Round>("post", `/admin/rounds/${round}/undo`),
  patchJersey: ({ number, quota }: { number: number; quota: { male: number; female: number } }) =>
    apiSend<AdminJersey>("patch", `/admin/jerseys/${number}`, { quota }),
  patchSettings: (body: Settings) => apiSend<Settings>("patch", "/admin/settings", body),
  assignPreview: (upToRound?: number) =>
    apiSend<AssignPreview>("post", "/admin/assign-remaining/preview", upToRound ? { upToRound } : {}),
  assignRemaining: (upToRound?: number) =>
    apiSend<AssignResult>("post", "/admin/assign-remaining", upToRound ? { upToRound } : {}),
};
