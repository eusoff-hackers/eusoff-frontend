import React from "react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { QueryObserverResult } from "@tanstack/react-query";
import axios from "axios";
import { Trash2 } from "lucide-react";

import type { ToastMessage } from "@/src/app/dashboard/jersey/page";

import { BiddingData, EligibleBids, UserBid } from "../dashboard/jersey/types";

interface BiddingList {
  user:any,
  userBids: UserBid;
  refetchUserBids: () => Promise<QueryObserverResult<UserBid, Error>>;
  biddings: BiddingData;
  userEligibleBids: EligibleBids;
  // setBiddings: React.Dispatch<React.SetStateAction<Bidding[]>>;
  // updateUser: () => void;
  // setToast: React.Dispatch<React.SetStateAction<ToastMessage>>;
  // handleOpen: () => void;
}

axios.defaults.withCredentials = true;

// User submit bid form
const BiddingTable: React.FC<BiddingList> = ({user, userBids, refetchUserBids, biddings, userEligibleBids }) => {
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

  const handlePlaceBid = async (number: number) => {
    try {
      const newBids = {
        bids: [
          ...curr_userBids,
          {
            number,
            priority: curr_userBids.length + 1,
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

  // const getEligibleNumbers = () => {
  //   return userEligibleBids.bids.map(bid => bid.jersey.number);
  // };

  // const eligibleNumbers = getEligibleNumbers();

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
                  // onClick={() => deleteBid(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <ArrowUpDown className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Submit
          </Button>
    </div>*/
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Bidding Table</h1>
      <Card className="mx-auto mb-2 w-full">
          <CardHeader className="space-y-1 sm:space-y-1">
            <CardTitle className="text-l sm:text-l font-bold">{user.username}</CardTitle>
            <CardDescription className="text-sm sm:text-base">Year: {user.year}, Gender: {user.gender}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Round To Bid: {userBids.info.round} </h2>
                  <p className="text-lg font-bold text-primary">Current Round: {userBids.system.bidRound}</p>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Status: </h2>
                  <p className="text-lg font-bold text-primary">{canBid ? "Can Bid" : "Cannot Bid"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Points:</h2>
                  <p className="text-lg font-bold text-primary">{userBids.info.points.toLocaleString()}</p>
                </div>
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Teams : </h2>
                  <div className="flex flex-wrap gap-2">
                    {userBids.info.teams.map(team => (
                      <Badge key={team.team.name} variant="outline" className={`bg-green-500 text-white`}>
                        {team.team.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end"></div>
          </CardContent>
        </Card>

      {userBids && (
        <Card className="mx-auto mb-2 w-full">
          <CardHeader className="space-y-1 sm:space-y-1">
            <CardTitle className="text-l sm:text-l font-bold">Your Bids</CardTitle>
            <CardDescription className="text-sm sm:text-base">View and manage your current bids</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] sm:w-[50%]">Bidding Number</TableHead>
                    <TableHead className="w-[20%] sm:w-[25%]">Priority</TableHead>
                    <TableHead className="w-[40%] text-right sm:w-[25%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBids.bids.map((bid, index) => (
                    <TableRow key={bid.priority}>
                      <TableCell className="font-medium">{bid.jersey.number}</TableCell>
                      <TableCell>{bid.priority + 1}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1 sm:space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => handleDeleteBid(bid.jersey.number)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end"></div>
          </CardContent>
        </Card>
      )}

      <h1 className="text-l mb-4 font-bold"> Eligible Bidding Numbers : </h1>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: 100 }, (_, i) => i ).map(number => {
          const isEligible = userEligibleBids !== undefined ? userEligibleBids.jerseys.includes(number) : false; // Check if the number is eligible
          return (
            <Button
              key={number}
              onClick={() => isEligible && handleOpenModal(number)} // Only open modal if eligible
              variant="outline"
              className={`h-12 w-full ${!isEligible ? "cursor-not-allowed opacity-50" : ""}`} // Apply grayed out style if not eligible
              disabled={!isEligible} // Disable button if not eligible
            >
              {number}
            </Button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Biddings for Number {selectedNumber}</DialogTitle>
          </DialogHeader>
          <h1> Your Points : {userBids.info.points}</h1>
          {selectedNumber && biddings && biddings[selectedNumber] && (
            <div className="flex flex-row justify-between">
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
            <Button className="w-full sm:w-auto" disabled={!canBid} onClick={() => handlePlaceBid(selectedNumber)}>
              Place Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiddingTable;
