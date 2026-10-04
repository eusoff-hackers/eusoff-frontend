"use client";

import React, { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import BiddingTable from "@/src/app/components/BiddingTable";
import Loading from "@/src/app/components/Loading";
import RoundTimeline from "@/src/app/components/RoundTimeline";
import { ErrorState } from "@/src/app/components/system";
import { AllocatedCard, JerseyIdentity, PointsCard, StatusBanner } from "@/src/app/dashboard/jersey/JerseyOverview";
import type { BiddingData, EligibleBids, UserBid } from "@/src/app/dashboard/jersey/types";
import { apiGet, errorStatus } from "@/src/app/lib/api";
import { useNow } from "@/src/app/lib/time";
import { removeUser, selectUser } from "@/src/app/redux/Resources/userSlice";

const GRID_ID = "numbers";

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
    // Keep the status card in step with round open/close
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
    if (user == null) router.push("/");
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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ErrorState title="Your jersey info didn't load" error={userBidsError} onRetry={() => refetchUserBids()} />
      </div>
    );
  }

  if (userBids === undefined) return <Loading />;

  const rounds = userBids.system.rounds ?? [];
  const allocated = !!(userBids.info.isAllocated && userBids.info.jersey);
  const scrollToGrid = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(GRID_ID)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6 sm:px-6 sm:py-10">
      <JerseyIdentity user={user} round={userBids.info.round} />

      {allocated ? (
        <div className="pt-2">
          <AllocatedCard data={userBids} />
        </div>
      ) : (
        <div className="grid gap-4 pt-2 md:grid-cols-[1.15fr,1fr]">
          <PointsCard data={userBids} />
          {/* On phones the actionable status comes first. */}
          <div className="order-first flex min-w-0 flex-col md:order-none [&>section]:flex-1">
            <StatusBanner
              data={userBids}
              now={now}
              bidCount={userBids.bids.filter(b => b.round == null || b.round === userBids.system.bidRound).length}
              onChoose={scrollToGrid}
            />
          </div>
        </div>
      )}

      {!allocated && (
        <BiddingTable
          user={user}
          userBids={userBids}
          refetchUserBids={refetchUserBids}
          biddings={bids}
          userEligibleBids={userEligibleBids}
          gridId={GRID_ID}
        />
      )}

      {rounds.length > 0 && (
        <section className="surface-card p-4 sm:p-6" aria-labelledby="schedule-heading">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="schedule-heading" className="text-[17px] font-medium tracking-heading text-heading">
              Round schedule
            </h2>
            <p className="text-[13px] text-faint">Singapore time</p>
          </div>
          <RoundTimeline rounds={rounds} now={now} highlightRound={userBids.info.round} />
        </section>
      )}

    </div>
  );
};

export default Jersey;
