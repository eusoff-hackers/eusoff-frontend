"use client";

// This is a client component 👈🏽
import React, { useEffect, useState } from "react";

import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import Loading from "@/src/app/components/Loading";
import type { ProfileTableItems } from "@/src/app/components/Profile/ProfileTable";
import ProfileTable from "@/src/app/components/Profile/ProfileTable";
import { selectUser, setUser } from "@/src/app/redux/Resources/userSlice";

const axios = require("axios");
const axiosWithCredentials = axios.create({
  withCredentials: true,
});

export interface RoomInfoType {
  isEligible: boolean;
  points: number;
  canBid: boolean;
  bids: RoomType[];
}

export interface RoomType {
  room: {
    block: string;
    number: number;
    capacity: number;
    occupancy: number;
    allowedGenders: string[];
  };
}

const ProfilePage = () => {
  // retrieve user data
  const user = useSelector(selectUser);
  const route = useRouter();
  const dispatch = useDispatch();

  const [isClient, setIsClient] = useState(false);
  const [userInfo, setUserInfo] = useState<ProfileTableItems[]>([]);
  const [roomBidInfo, setRoomBidInfo] = useState<RoomInfoType>();
  const [ccaInfo, setCcaInfo] = useState<ProfileTableItems[]>([]);

  useEffect(() => {
    if (user == null) {
      route.push("/");
      return;
    }
    setIsClient(true);
    fetchRoomBidInfo();
    getUserInfo();
  }, [user, route]);

  // api call to fetch user's room bidding points, eligibility
  const fetchRoomBidInfo = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/info`);

      if (response.data.success) {
        console.log("This is eligible bids info " + JSON.stringify(response.data.data));

        // set user general room bid info
        const roomBidInfo: RoomInfoType = {
          isEligible: response.data.data.info.isEligible,
          points: response.data.data.info.points,
          canBid: response.data.data.info.canBid,
          bids: response.data.data.bids,
        };
        setRoomBidInfo(roomBidInfo);

        // set user cca points info
        const ccaData = response.data.data.info.pointsDistribution;
        const ccaInfoTemp: ProfileTableItems[] = [];
        ccaData.forEach((element: any) => {
          ccaInfoTemp.push({ title: element.cca, value: element.points });
        });
        setCcaInfo(ccaInfoTemp);
      } else {
        console.log({ message: "Failed to fetch data" });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response.status == 401) {
          console.error("Session Expired");
          dispatch(setUser(null));
          route.push("/");
        }
      }
      console.error("Error during fetching data", error);
    }
  };

  const getUserInfo = () => {
    const userData: ProfileTableItems[] = [
      { title: "Username", value: user.username },
      { title: "Year", value: `${user.year}` },
    ];
    setUserInfo(userData);
  };

  console.log(roomBidInfo);

  return !isClient || user == null ? (
    <Loading />
  ) : (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-tl from-slate-200 to-slate-300 lg:flex-row">
      <main className="h-fit w-full">
        {/*Top Banner*/}
        <div className="m-0 bg-gradient-to-r from-cyan-500 to-blue-500 p-2 text-center font-mono text-4xl font-bold uppercase text-zinc-950 hover:shadow-2xl">
          Profile
        </div>

        {/*Main Content*/}
        <div className="flex flex-col items-center justify-center">
          <div className="divide-y-5 m-auto mb-3 mt-10 grid w-5/6 grid-flow-row gap-0 rounded-lg bg-slate-200 px-5 py-10 font-mono text-3xl shadow-2xl md:grid-flow-col md:items-center">
            {/*Placeholder image and log in text*/}
            <div className="bg-slate-200 text-center">
              <img
                className="m-auto h-48 w-48 rounded-full border-4 border-dashed border-indigo-950 shadow-2xl shadow-sky-200"
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              />
              <br />
              <h1 className="text-black">
                logged in as <br /> <b>{user.username}</b>
              </h1>
            </div>

            {/*Table displaying user data*/}
            <ProfileTable tabledata={userInfo} />
          </div>

          {/*Room Bidding*/}
          <div className="w-5/6 bg-slate-200 text-center text-gray-800 shadow-2xl">
            <h1 className="text-3xl">Room Bidding</h1>
            {roomBidInfo == null ? (
              <p>Loading...</p>
            ) : (
              <ul>
                <li>{`Total Bidding points: ${roomBidInfo.points}`}</li>
                <li>{`Qualified to stay: ${roomBidInfo.isEligible ? `Yes` : `No`} `}</li>
                {/* <li>{`Can bid: ${roomBidInfo.canBid}`}</li> */}
              </ul>
            )}
            <div className="px-5 py-5">
              <h1 className="text-2xl">CCA Points Distribution</h1>
              <ProfileTable tabledata={ccaInfo} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
