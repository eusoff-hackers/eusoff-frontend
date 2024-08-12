"use client";

// This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useRouter } from "next/navigation";

import type { AlertColor } from "@mui/material";
import { selectUser } from "@/src/app/redux/Resources/userSlice";

export interface Bidding {
  number: number;
}

export interface Teams {
  name: String;
  shareable: boolean;
}

export interface ToastMessage {
  message: String;
  severity: AlertColor; // Possible to create enum in the future
}

// Create an instance of axios with credentials
axios.defaults.withCredentials = true;

const Jersey: React.FC = () => {
  const user = useSelector(selectUser);
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  const userBiddings: Bidding[] = [];

  // State to manage error toast throughout app

  // State for the Snackbar component
  // Does a call for eligible bids. API still WIP
  const getEligibleBids = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/eligible`);

      if (response.data.success) {
        setAllowedBids(response.data.data.jerseys);
        console.log("This is eligible bids" + JSON.stringify(response.data.data.jerseys));
      }
    } catch (error) {
      console.error("Error during getting allowed bids", error);
    }
  };

  // Does a call for user's teams
  const getUserTeam = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team/info`);

      if (response.data.success) {
        setTeams(response.data.data.teams);
        console.log("This is user's team" + JSON.stringify(response.data.data.teams));
      }
    } catch (error) {
      console.error("Error during getting user's teams", error);
    }
  };

  // Saves changes to user_biddings in local storage
  useEffect(() => {
    localStorage.setItem("user_biddings", JSON.stringify(biddings));
  }, [biddings]);

  useEffect(() => {
    setIsClient(true); // Indicate that client has been rendered
    getEligibleBids(); // Get all eligible bids when page renders
    getUserTeam(); // Get user's team when page renders
    console.log("Saved user: " + JSON.stringify(user));
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
      {/* Your content goes here */}
    </div>
  );
};

const Loading = () => (
  <div>Loading...</div>
);

export default Jersey;
