"use client";

import React from "react";
import { useEffect, useState } from "react";

// Room Dialog Imports
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import type { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import LeaderboardDialog from "@/src/app/components/LeaderboardDialog";
import type { RoomInfoType, RoomType } from "@/src/app/dashboard/profile/page";
import { selectUser, setUser } from "@/src/app/redux/Resources/userSlice";

export interface Room {
  _id: string;
  block: string;
  number: number;
  capacity: number;
  occupancy: number;
  allowedGenders: string[];
  bidders: bidderInfo[];
}

export interface bidderInfo {
  user: {
    username: string;
    role: string;
    year: number;
    gender: string;
    room: string;
  };
  info: {
    isEligible: boolean;
    points: number;
  };
}

export interface BlockInfo {
  quota: number;
  bidderCount: number;
}

export interface RoomBlock {
  block: string;
  quota: number;
  bidderCount: number;
}

export interface RoomDet {
  block: string;
  number: number;
}
const axios = require("axios");

const hallBlocks = ["A", "B", "C", "D", "E"];

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RoomBidding: React.FC = () => {
  const user = useSelector(selectUser);
  const route = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockfilter, setBlockFilter] = useState<string>("A");
  const [userInfo, setUserInfo] = useState<RoomInfoType>();
  const [blockData, setBlockData] = useState<Record<string, BlockInfo>>({});
  const [roomSelect, setRoomSelect] = useState<Room>({
    _id: "",
    block: "",
    number: 0,
    capacity: 0,
    occupancy: 0,
    allowedGenders: [""],
    bidders: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const objectify = (array: RoomBlock[]): Record<string, BlockInfo> => {
    const object: Record<string, BlockInfo> = {};
    array.forEach(item => {
      object[item.block] = { quota: item.quota, bidderCount: item.bidderCount };
    });
    return object;
  };

  const createLeaderboard = (block: string) => {
    // Filter rooms by block and flatMap to get an array of all bidders in that block
    const getAllBiddersForBlock: bidderInfo[] = roomList
      .filter(room => room.block === block)
      .flatMap(room => room.bidders);

    // Sort bidders by points in descending order
    const sortedBidders: bidderInfo[] = getAllBiddersForBlock.sort((a: bidderInfo, b: bidderInfo) => b.info.points - a.info.points);

    return sortedBidders;
  };

  const handleDialogOpen = (room: Room) => {
    setDialogOpen(true);
    setRoomSelect(room);
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      setDialogOpen(false);
    }
  };

  const handleBlockFilter = (block: string) => {
    setBlockFilter(block);
  };

  const handleBidAcceptance = (roomSelect: Room) => {
    if (userInfo?.bids[0] == null && userInfo?.canBid) {
      const newRoom: RoomType = {
        room: {
          block: roomSelect.block,
          number: roomSelect.number,
          capacity: roomSelect.capacity,
          occupancy: roomSelect.occupancy,
          allowedGenders: roomSelect.allowedGenders,
        },
      };

      setUserInfo({
        ...userInfo,
        bids: [newRoom], // Adding the new room
      });
    } else if (userInfo?.bids[0]) {
      userInfo.bids[0].room.block = roomSelect.block;
      userInfo.bids[0].room.number = roomSelect.number;
    }
    setIsSubmitting(true);
    submitBid();
    setIsSubmitting(false);
  };

  useEffect(() => {
    fetchRoomBidInfo();
    fetchRooms();

    const interval = setInterval(() => {
      fetchRoomBidInfo();
      fetchRooms();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // api call to make room bidding submission
  const submitBid = async () => {
    try {
      const response: AxiosResponse<any> = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/bid`, {
        rooms: [{ _id: roomSelect._id }],
      });
      if (response.status === 200) {
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error during submission", error);
    }
  };

  // api call to fetch all rooms
  const fetchRooms = async () => {
    try {
      const response: AxiosResponse<any> = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/list`);
      if (response.data.success) {
        setLoading(!response.data.success);
        setBlockData(objectify(response.data.data.blocks));
        setRoomList(response.data.data.rooms);
      }
    } catch (error) {
      console.error("Error during fetching rooms", error);
    }
  };

  // api call to fetch user's room bidding info (duplicate call in profile page, can be refactored to be more efficient)
  const fetchRoomBidInfo = async () => {
    try {
      const response: AxiosResponse<any> = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/info`);

      if (response.data.success) {
        const roomBidInfo: RoomInfoType = {
          isEligible: response.data.data.info.isEligible,
          points: response.data.data.info.points,
          canBid: response.data.data.info.canBid,
          bids: response.data.data.bids,
        };
        setUserInfo(roomBidInfo);
        setUserLoading(!response.data.success);
      } else {
        console.log({ message: "Failed to fetch data" });
      }
    } catch (error) {
      if ((error as AxiosError).response?.status === 401) {
        console.error("Session Expired");
        dispatch(setUser(null));
        route.push("/");
      }
      console.error("Error during fetching data", error);
    }
  };

  return loading || userLoading ? (
    <div className="flex h-screen items-center justify-center">
      <div className="h-20 w-20 animate-ping rounded-full bg-violet-800"></div>
    </div>
  ) : (
    <div className="flex min-h-screen flex-col bg-gradient-to-tl from-slate-200 to-slate-300 lg:flex-row">
      <main className="h-full w-full">
        {/*Top Banner */}
        <div className="m-0 flex w-full flex-row bg-gradient-to-r from-[#80fbff] to-[#9089fc] p-2 font-mono font-bold uppercase opacity-100 hover:shadow-2xl">
          <div className="text-left text-2xl text-gray-900">Eusoff Room Bidding</div>
        </div>
        {/*Top Banner Alternative Color Scheme
        bg-gradient-to-r from-[#25AE8D] to-[#008087]
          bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30
        */}

        <div className="divide-y-5 m-auto mb-3 mt-10 flex w-5/6 flex-col justify-between rounded-lg bg-slate-200 px-5 py-10 font-mono text-xl shadow-2xl md:flex-row">
          <div className="text-left text-gray-900">
            Current Bid:{" "}
            {userInfo?.bids[0]?.room
              ? `${userInfo.bids[0].room.block}${userInfo.bids[0].room.number}`
              : "No Room Selected"}
          </div>
          <div className="text-left text-gray-900 md:text-right">Points : {userInfo?.points}</div>
        </div>

        {/*Main Content*/}
        <div className="divide-y-5 m-auto mb-3 mt-10 flex h-full w-5/6 flex-col items-center rounded-lg bg-slate-200 px-5 py-10 font-mono text-3xl shadow-2xl">
          {/*Dialog Box*/}
          <React.Fragment>
            <Dialog open={dialogOpen} TransitionComponent={Transition} keepMounted onClose={handleDialogClose}>
              <DialogTitle>{`Room Number:  ${roomSelect.block}${roomSelect.number}`}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {roomSelect.capacity == 1 ? "Room Type: Single Room" : "Room Type: Double Room"}
                </DialogContentText>
                <br />
                <DialogContentText>
                  <p className="font-bold">Bidders List:</p>
                </DialogContentText>
                {roomSelect.bidders.length != 0 &&
                  roomSelect.bidders
                    .slice() // Make a shallow copy of the array to prevent mutating the original
                    .sort((a, b) => b.info.points - a.info.points) //
                    .map((bidder, index) => {
                      return (
                        <DialogContentText key={index}>
                          {`Bidder ${index + 1}: ${bidder.user.room.replace(/EH|\s|\/.*?\//g, "")} - ${bidder.info.points} points`}
                        </DialogContentText>
                      );
                    })}
                <DialogContentText>&nbsp;</DialogContentText>
                <DialogContentText>Are you sure you want to choose this room?</DialogContentText>
              </DialogContent>
              <DialogActions>
                {userInfo.canBid ? (
                  <>
                    <Button
                      color="success"
                      onClick={() => {
                        handleBidAcceptance(roomSelect);
                      }}
                    >
                      Accept
                    </Button>
                    <Button color="error" onClick={handleDialogClose}>
                      Close
                    </Button>
                  </>
                ) : (
                  <p>Not eligible for bidding</p>
                )}
              </DialogActions>
            </Dialog>
          </React.Fragment>

          <div className="flex h-full w-full flex-col bg-slate-200 text-center">
            <h1 className="border-b-2 border-b-slate-400 text-black">Available Rooms</h1>

            <div className="flex flex-row items-center justify-center">
              <p className="font-mono text-xs text-black lg:text-xl">Select Block:</p>
              {hallBlocks.map((block, index) => {
                return (
                  <div
                    key={index}
                    className={`m-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-xl font-semibold text-white hover:bg-gray-500 ${blockfilter === block ? "bg-blue-500" : "bg-gray-800"}`}
                    onClick={() => handleBlockFilter(block)}
                  >
                    {block}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-row items-center justify-center">
              <p className="font-mono text-xs text-black lg:text-xl">
                {" "}
                Block Quota : {blockData[blockfilter].quota} , Bids : {blockData[blockfilter].bidderCount}
              </p>
            </div>
            <div className="mt-5 grid h-full w-full grid-cols-4 gap-4 gap-y-5 md:grid-cols-5 lg:grid-cols-10">
              {roomList !== null &&
                user != null &&
                roomList
                  .filter(
                    room => room.block == blockfilter && room.allowedGenders[0] == user.gender, // checks if block selected and gender same as user
                  )
                  .map((room, index) => {
                    const block = room.block;
                    const number = room.number;
                    const capacity = room.capacity;

                    return (
                      <div
                        key={index}
                        className={`m-2 flex h-16 w-16 cursor-pointer items-center justify-center bg-gray-800 text-xl font-semibold text-white hover:bg-gray-500`}
                        onClick={() => {
                          handleDialogOpen(room);
                        }}
                      >
                        {block}
                        {number}
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        <div className="divide-y-5 m-auto mb-3 mt-10 flex w-5/6 flex-col justify-between rounded-lg bg-slate-200 px-5 py-10 font-mono text-xl shadow-2xl md:flex-row">
          <LeaderboardDialog data={createLeaderboard(blockfilter)} />
        </div>
      </main>
    </div>
  );
};

export default RoomBidding;
