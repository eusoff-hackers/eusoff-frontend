"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser } from "@/src/app/redux/Resources/userSlice";
import Loading from "@/src/app/components/Loading";
import { type AxiosError } from "axios";
const axios = require("axios");

export interface RoomInfoType {
  isEligible: boolean;
  points: number;
  canBid: boolean;
  bids?: { room: { block: string; number: number } }[];
}

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isClient, setIsClient] = useState(false);
  const [roomBidInfo, setRoomBidInfo] = useState<RoomInfoType>();
  const [ccaPoints, setCcaPoints] = useState<{ cca: string; points: number }[]>([]);
  const [easterEgg, setEasterEgg] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading flag

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    setIsClient(true);
    fetchRoomBidInfo();
  }, [user, router]);

  const fetchRoomBidInfo = async () => {
    try {
      setIsLoading(true); // Set loading to true when fetch starts
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/info`);
      if (response.data.success) {
        const roomBidInfo: RoomInfoType = {
          isEligible: response.data.data.info.isEligible,
          points: response.data.data.info.points,
          canBid: response.data.data.info.canBid,
          bids: response.data.data.bids,
        };
        setRoomBidInfo(roomBidInfo);
        setCcaPoints(response.data.data.info.pointsDistribution || []); // Default to empty array if undefined
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          dispatch(setUser(null));
          router.push("/");
        }
      }
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Set loading to false when fetch completes (success or failure)
    }
  };

  const isSuperhero = roomBidInfo?.points && roomBidInfo.points > 100;

  const handleEasterEggClick = () => {
    if (!easterEgg) {
      setEasterEgg(true);
      setTimeout(() => setEasterEgg(false), 3000); // Hide after 3 seconds
    }
  };

  return !isClient || !user ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <div
          className="bg-white rounded-lg shadow-sm p-6 transform hover:shadow-md transition-all duration-300 animate-fade-in"
          onClick={handleEasterEggClick}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <Image
                className="rounded-full border-2 border-gray-300 shadow-sm hover:animate-wiggle"
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                alt="profile picture"
                width={90}
                height={90}
              />
              {isSuperhero && (
                <span className="absolute -top-1 -right-1 bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                  🌟
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                {user.username} {isSuperhero && "✨"}
              </h1>
              <p className="text-gray-500">Year {user.year}</p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                  Points: {roomBidInfo?.points || "Loading..."}
                </span>
                {isSuperhero && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                    Star Status
                  </span>
                )}
              </div>
            </div>
          </div>
          {easterEgg && (
            <p className="mt-2 text-center text-sm text-gray-500 animate-bounce">
              Surprise! You found a hidden spark! ✨
            </p>
          )}
        </div>

        {/* CCA Points Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">
            Your Activities
          </h2>
          {isLoading ? (
            <p className="text-gray-500 text-center">Loading your activities...</p>
          ) : ccaPoints.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {ccaPoints
                .sort((a, b) => b.points - a.points)
                .map((cca, index) => (
                  <div
                    key={index}
                    className="group bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium truncate">{cca.cca}</span>
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold shadow-sm group-hover:animate-pulse">
                          {cca.points}
                        </div>
                        <span className="absolute -top-1 -right-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No activities found.</p>
          )}
          {isSuperhero && (
            <p className="mt-4 text-sm text-gray-500 text-center animate-pulse">
              Shining bright like a star! 🌟
            </p>
          )}
        </div>
      </div>

      {/* Hidden Bunny Easter Egg */}
      <div
        className="fixed bottom-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        onClick={() => alert("Bunny says: You’re hopping awesome! 🐾")}
      >
        🐰
      </div>
    </div>
  );
};

export default ProfilePage;

/* Custom Tailwind Animations */
const customStyles = `
  @tailwind components;
  @layer components {
    .animate-fade-in {
      animation: fadeIn 0.5s ease-in;
    }
    .animate-slide-up {
      animation: slideUp 0.5s ease-out;
    }
    .animate-wiggle {
      animation: wiggle 0.5s infinite;
    }
    .animate-pulse {
      animation: pulse 1.5s infinite;
    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes wiggle {
    0% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
    100% { transform: rotate(-3deg); }
  }
`;