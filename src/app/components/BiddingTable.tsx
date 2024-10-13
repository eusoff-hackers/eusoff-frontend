import React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { QueryObserverResult } from "@tanstack/react-query";
import axios from "axios";

import type { ToastMessage } from "@/src/app/dashboard/jersey/page";

import { BiddingData, UserBid } from "../dashboard/jersey/types";

interface BiddingList {
  userBids: UserBid;
  refetchUserBids: () => Promise<QueryObserverResult<UserBid, Error>>;
  biddings: BiddingData;
  // setBiddings: React.Dispatch<React.SetStateAction<Bidding[]>>;
  // updateUser: () => void;
  // setToast: React.Dispatch<React.SetStateAction<ToastMessage>>;
  // handleOpen: () => void;
}

axios.defaults.withCredentials = true;

// User submit bid form
const BiddingTable: React.FC<BiddingList> = ({ userBids, refetchUserBids, biddings }) => {
  const [open, setOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const priority = userBids ? userBids.bids.length : 0;

  const curr_userBids = userBids.bids.map(bid => {
    return {
      number: bid.jersey.number,
      priority: bid.priority,
    };
  });

  const canBid = userBids.canBid;

  const handleOpenModal = (number: number) => {
    setOpen(true);
    setSelectedNumber(number);
  };
  const handlePlaceBid = async (number: number, priority: number) => {
    try {
      const newBids = {
        bids: [
          ...curr_userBids,
          {
            number,
            priority,
          },
        ],
      };
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/bid`, newBids);

      if (resp.status === 200) {
        refetchUserBids();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteBid = async (number: number) => {
    try {
      const newBids = curr_userBids.filter(bid => bid.number !== number);
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/bid`, {
        bids: newBids,
      });

      if (resp.status == 200) {
        refetchUserBids();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // const deleteBid = (ind: number) => {
  //   const filteredList = biddings.filter(bidding => bidding.number != biddings[ind].number);
  //   setBiddings(filteredList);
  // };

  // Currently unable to make the api call
  // const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axiosWithCredentials.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bid/create`, {
  //       biddings: biddings,
  //     });

  //     if (response.data.success) {
  //       setToast({ message: "biddings submitted", severity: "success" });
  //       handleOpen();
  //       updateUser();
  //     } else {
  //       console.error("biddings failed");
  //       setToast({ message: "biddings failed to be submitted", severity: "error" });
  //       handleOpen();
  //     }
  //   } catch (error) {
  //     console.error("Error during form submission", error);
  //   }
  // };

  return (
    /*<div>
      <div className="flex items-center justify-between space-x-4 py-2">
        <h2 className="py-2 text-xl font-semibold">Submit new biddings:</h2>
        <div className="flex items-center justify-between space-x-2">
          <div className="flex rounded-lg p-2 text-sm font-bold text-orange-400">
            <svg
              className="h-5 w-5"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            <p className="pl-2">Ensure you click submit to confirm changes</p>
          </div>

          {/* {biddings.length == 0 ? (
            <></>
          ) : (
            <button
              type="submit"
              className="rounded bg-blue-500 px-2 py-2 text-white hover:bg-blue-600 focus:outline-none"
              // onClick={e => handleSubmit(e)}
            >
              Submit
            </button>
          )} }
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase leading-4 tracking-wider">Ranking</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase leading-4 tracking-wider">
              Jersey Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase leading-4 tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-gray-50">
          {Object.entries(biddings).map(([jerseyNumber, bidding], index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="whitespace-no-wrap px-6 py-4">{jerseyNumber}</td>
              {/* <td className="whitespace-no-wrap px-6 py-4">{bidding.number}</td> }
              <td className="whitespace-no-wrap px-6 py-4">
                <button
                  className="rounded bg-red-100 px-3 py-1 text-red-500 hover:bg-red-200 focus:outline-none"
                  // onClick={() => deleteBid(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>*/
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Bidding Table</h1>
      {userBids !== undefined && (
        <div className="mb-4 flex w-full flex-col items-center justify-center border-2 py-2">
          <div className="font-bold">Your bids</div>
          <div>Status: {canBid ? "Can Bid" : "Cannot bid"} </div>
          {userBids.bids.map((bid, ind) => (
            <div className="grid w-1/2 grid-cols-2 place-items-center" key={ind}>
              <div>Bidding Number: {bid.jersey.number}</div>
              <div className="flex h-full flex-row space-x-2">
                <span>Priority: {bid.priority + 1} </span>

                <Icon
                  className="h-full hover:cursor-pointer"
                  icon="material-symbols:delete"
                  onClick={() => handleDeleteBid(bid.jersey.number)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(number => (
          <Button key={number} onClick={() => handleOpenModal(number)} variant="outline" className="h-12 w-full">
            {number}
          </Button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>biddings for Number {selectedNumber}</DialogTitle>
          </DialogHeader>
          {selectedNumber && biddings && biddings[selectedNumber] && (
            <div>
              <div>Quota M: {biddings[selectedNumber].quota.male}</div>
              <div>Quota F: {biddings[selectedNumber].quota.female}</div>
            </div>
          )}
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Room Number</TableHead>
                  <TableHead className="w-1/2">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedNumber &&
                  biddings[selectedNumber] &&
                  biddings[selectedNumber].male.map((bid, index) => (
                    <TableRow key={index}>
                      <TableCell>{bid.user} (M)</TableCell>
                      <TableCell>${bid.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                {selectedNumber &&
                  biddings[selectedNumber] &&
                  biddings[selectedNumber].female.map((bid, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{bid.user.room} (F)</TableCell>
                        <TableCell>{bid.points}</TableCell>
                      </TableRow>
                    );
                  })}

                {/* {(!selectedNumber || !biddings[selectedNumber] || bids[selectedNumber].length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No biddings yet
                    </TableCell>
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
            <Button
              className="w-full sm:w-auto"
              disabled={!canBid}
              onClick={() => handlePlaceBid(selectedNumber, priority + 1)}
            >
              Place Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiddingTable;
