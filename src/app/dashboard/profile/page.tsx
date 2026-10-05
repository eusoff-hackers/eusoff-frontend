"use client";

import React, { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import Loading from "@/src/app/components/Loading";
import { PageHeader, Skeleton } from "@/src/app/components/system";
import type { UserBid } from "@/src/app/dashboard/jersey/types";
import { apiGet, errorStatus } from "@/src/app/lib/api";
import { useLogout } from "@/src/app/lib/useLogout";
import { removeUser, selectUser } from "@/src/app/redux/Resources/userSlice";

const genderLabel = (g: string | undefined) =>
  g === "male" ? "Male" : g === "female" ? "Female" : "Not on record";

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const router = useRouter();
  const dispatch = useDispatch();
  const logout = useLogout();
  const [isClient, setIsClient] = useState(false);

  const { data, error, isLoading } = useQuery<UserBid>({
    queryKey: ["user_bids"],
    queryFn: () => apiGet<UserBid>("/jersey/info"),
    enabled: user != null,
  });

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (user == null) router.push("/");
  }, [user, router]);
  useEffect(() => {
    if (errorStatus(error) === 401) {
      dispatch(removeUser());
      router.push("/");
    }
  }, [error, dispatch, router]);

  if (!isClient || !user) return <Loading />;

  const details: { label: string; value: React.ReactNode }[] = [
    { label: "Matric number", value: user.username },
    { label: "Room", value: user.room && user.room !== "-" ? user.room : "Not on record" },
    { label: "Year", value: user.year ? `Year ${user.year}` : "Not on record" },
    { label: "Gender", value: genderLabel(user.gender) },
    { label: "Bidding round", value: data ? `Round ${data.info.round}` : isLoading ? null : "Not on record" },
  ];

  const allocated = data?.info.isAllocated && data.info.jersey;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <PageHeader eyebrow="Profile" title={user.name ?? user.username} />

      <div className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
        <section className="surface-card p-4 sm:p-6" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-[17px] font-medium tracking-heading text-heading">
            Your details
          </h2>
          <dl className="mt-4">
            {details.map(d => (
              <div
                key={d.label}
                className="flex items-baseline justify-between gap-4 border-b border-hairline py-3.5 last:border-0"
              >
                <dt className="text-sm text-silver">{d.label}</dt>
                <dd className="min-w-0 break-words text-right text-[15px] tabular-nums text-mist">
                  {d.value ?? <Skeleton className="ml-auto h-4 w-20" />}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] text-faint">Something wrong here? Contact the jersey committee.</p>
        </section>

        <section className="surface-card flex flex-col p-4 sm:p-6" aria-labelledby="jersey-heading">
          <h2 id="jersey-heading" className="eyebrow">
            {allocated ? "Your number" : "Your points"}
          </h2>
          {!data ? (
            <Skeleton className="mt-5 h-20 w-28" />
          ) : (
            <p className="stat mt-4 text-[clamp(3.5rem,2.6rem+4vw,5rem)]">{allocated ? data.info.jersey!.number : data.info.points}</p>
          )}
          <p className="mt-3 text-sm text-silver">
            {!data
              ? " "
              : allocated
                ? `Allocated in round ${data.info.allocatedRound ?? data.info.round}. ${data.info.points} points.`
                : "No number allocated yet."}
          </p>
          <div className="mt-6 md:mt-auto md:pt-6">
            <Link href="/dashboard/jersey" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              {allocated ? "View jersey page" : "Go to bidding"}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-start">
        <Button variant="ghost" onClick={logout}>
          <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Sign out
        </Button>
      </div>
    </div>
  );
}
