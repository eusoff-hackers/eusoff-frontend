"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import BiddingTable from "@/src/app/components/BiddingTable";
import Loading from "@/src/app/components/Loading";
import RoundTimeline from "@/src/app/components/RoundTimeline";
import { JerseyHeader, StatusBanner } from "@/src/app/dashboard/jersey/JerseyOverview";
import type { BiddingData, EligibleBids, UserBid } from "@/src/app/dashboard/jersey/types";
import { apiGet, errorMessage, errorStatus } from "@/src/app/lib/api";
import { useNow } from "@/src/app/lib/time";
import { removeUser, selectUser } from "@/src/app/redux/Resources/userSlice";

const Jersey: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const now = useNow();

  const { data: bids } = useQuery<BiddingData>({
    queryKey: ["bids"],
    queryFn: () => apiGet<BiddingData>("/jersey/list"),
    refetchInterval: 60_000,
  });

  const {
    data: userBids,
    error: userBidsError,
    refetch: refetchUserBids,
  } = useQuery<UserBid>({
    queryKey: ["user_bids"],
    queryFn: () => apiGet<UserBid>("/jersey/info"),
    // Keep the status banner in step with round open/close
    refetchInterval: 30_000,
  });

  const { data: userEligibleBids } = useQuery<EligibleBids>({
    queryKey: ["user_eligible_bids"],
    queryFn: () => apiGet<EligibleBids>("/jersey/eligible"),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user == null) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (errorStatus(userBidsError) === 401) {
      dispatch(removeUser());
      router.push("/");
    }
  }, [userBidsError, dispatch, router]);

  if (!isClient || user == null) return <Loading />;

  if (userBidsError && !userBids) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <p className="font-medium">Couldn&apos;t load your jersey info</p>
          <p className="text-sm">{errorMessage(userBidsError)}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchUserBids()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (userBids === undefined) return <Loading />;

  const rounds = userBids.system.rounds ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:px-6 sm:py-6">
      <JerseyHeader user={user} data={userBids} />
      <StatusBanner data={userBids} now={now} bidCount={userBids.bids.length} />
      {rounds.length > 0 && (
        <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-lg font-semibold">Round schedule</h2>
          <RoundTimeline rounds={rounds} now={now} highlightRound={userBids.info.round} />
          <p className="mt-3 text-xs text-muted-foreground">
            All times in Singapore time. Numbers are allocated after each round closes, by choice rank, then points,
            then seniority.
          </p>
        </section>
      )}
      <BiddingTable
        user={user}
        userBids={userBids}
        refetchUserBids={refetchUserBids}
        biddings={bids}
        userEligibleBids={userEligibleBids}
      />
    </div>
  );
};

export default Jersey;
