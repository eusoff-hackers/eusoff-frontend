"use client";

import React, { useEffect, useState } from "react";

import type { AlertColor } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { selectUser } from "@/src/app/redux/Resources/userSlice";
import BiddingTable from "@/src/app/components/BiddingTable";
import Loading from "@/src/app/components/Loading";

import type { BiddingData, EligibleBids, UserBid } from "@/src/app/dashboard/jersey/types";

export interface ToastMessage {
  message: String;
  severity: AlertColor;
}

// Create an instance of axios with credentials
axios.defaults.withCredentials = true;

const Jersey: React.FC = () => {
  const user = useSelector(selectUser);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const getBids = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/list`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error during getting allowed bids", error);
    }
  };

  const getUserBiddings = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/info`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error during getting user bids", error);
    }
  };

  const {
    data: bids,
  } = useQuery<BiddingData>({
    queryKey: ["bids"],
    queryFn: getBids,
  });

  const {
    data: userBids,
    refetch: refetchUserBids,
  } = useQuery<UserBid>({
    queryKey: ["user_bids"],
    queryFn: getUserBiddings,
  });

  const {
    data: userEligibleBids
  } = useQuery<EligibleBids>({
    queryKey: ["user_eligible_bids"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/eligible`);
        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        console.error("Error during getting eligible numbers", error);
      }
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user == null) {
      router.push("/");
    }
  }, [user, router]);

  return !isClient || user == null ? (
    <Loading />
  ) : (
    <div className="flex w-full flex-col lg:flex-row">
      {userBids === undefined ? (
        <Loading />
      ) : (
        <BiddingTable
          user={user}
          userBids={userBids}
          refetchUserBids={refetchUserBids}
          biddings={bids}
          userEligibleBids={userEligibleBids}
        />
      )}
    </div>
  );
};

export default Jersey;