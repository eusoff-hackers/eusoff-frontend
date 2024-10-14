"use client";

// This is a client component 👈🏽
import React, { useEffect, useState } from "react";

import type { AlertColor } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
<<<<<<< HEAD
import Loading from "../../components/Loading"
import BiddingTable from "../../components/BiddingTable";
import { selectUser } from "../../redux/Resources/userSlice";

import { Bidding, BiddingData, JerseyType, UserBid } from "./types";
=======

import { getUserBiddings, getUserEligibleBids } from "../../api/jerseyBidding";
import BiddingTable from "../../components/BiddingTable";
import Loading from "../../components/Loading";
import { selectUser } from "../../redux/Resources/userSlice";

import { BiddingData, EligibleBids, UserBid } from "./types";
>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf

export interface ToastMessage {
  message: String;
  severity: AlertColor; // Possible to create enum in the future
}

// new types

// Create an instance of axios with credentials
axios.defaults.withCredentials = true;

// @TODO This component is temporarily disabled, please fix linting issues

const Jersey: React.FC = () => {
  const user = useSelector(selectUser);
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  // Does a call for all bids
  const getBids = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/list`);

      console.log("response", response.data.data);

      if (response.data.success) {
        // console.log("This is eligible bids" + JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error("Error during getting allowed bids", error);
    }
  };
<<<<<<< HEAD

  // Does a call for User's bidding info
  const getUserBiddings = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/info`);

      console.log("response", response.data.data);

      if (response.data.success) {
        console.log("This is eligible bids" + JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error("Error during getting user bids", error);
    }
  };

  const getEligibleNumbers = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/eligible`);

      console.log("response", response.data.data);

      if (response.data.success) {
        console.log("This is eligible numbers" + JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error("Error during getting user bids", error);
    }
  }


=======

  // Does a call for User's bidding info
  // const getUserBiddings = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/info`);

  //     console.log("response", response.data.data);

  //     if (response.data.success) {
  //       console.log("This is eligible bids" + JSON.stringify(response.data.data));
  //       return response.data.data;
  //     }
  //   } catch (error) {
  //     console.error("Error during getting user bids", error);
  //   }
  // };

>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf
  const {
    data: bids,
    status: bidsStatus,
    refetch: refetchBids,
  } = useQuery<BiddingData>({
    queryKey: ["bids"],
    queryFn: getBids,
  });

  const {
    data: userBids,
    status: userBidsStatus,
    refetch: refetchUserBids,
  } = useQuery<UserBid>({
    queryKey: ["user_bids"],
    queryFn: getUserBiddings,
  });

  const {
    data: userEligibleBids,
    status: userEligibleBidsStatus,
    refetch: refetchUserElligbleBids,
<<<<<<< HEAD
  } = useQuery<number[]>({
    queryKey: ["user_eligible_bids"],
    queryFn: getEligibleNumbers,
  });

  // console.log('bids',bids);
   //console.log("userBids", userBids);
   console.log("userEligible", userEligibleBids);
=======
  } = useQuery<EligibleBids>({
    queryKey: ["user_eligible_bids"],
    queryFn: getUserEligibleBids,
  });

  // console.log('bids',bids);
  // console.log("userEligible", userEligibleBids);
>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf
  // State to manage error toast throughout app

  // State for the Snackbar component

  // Does a call for user's teams
  // const getUserTeam = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team/info`);

  //     if (response.data.success) {
  //       // setTeams(response.data.data.teams);
  //       console.log("This is user's team" + JSON.stringify(response.data.data.teams));
  //     }
  //   } catch (error) {
  //     console.error("Error during getting user's teams", error);
  //   }
  // };

  // Saves changes to user_biddings in local storage
  // useEffect(() => {
  //   localStorage.setItem("user_biddings", JSON.stringify(biddings));
  // }, [biddings]);

  useEffect(() => {
    setIsClient(true); // Indicate that client has been rendered
    // getEligibleBids(); // Get all eligible bids when page renders
    // getUserTeam(); // Get user's team when page renders
  }, []);

  // If not authorized, then redirects the user
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
<<<<<<< HEAD
        <BiddingTable userBids={userBids} refetchUserBids={refetchUserBids} biddings={bids} userEligibleBids={userEligibleBids} />
)}
=======
        <BiddingTable
          userBids={userBids}
          refetchUserBids={refetchUserBids}
          biddings={bids}
          userEligibleBids={userEligibleBids}
        />
      )}
>>>>>>> 81df05bbaae3cbaa3ef923043f4dd1a0af505bbf
    </div>
  );
  return <Loading />;
};

export default Jersey;
