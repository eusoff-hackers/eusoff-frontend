import React from "react";

import type { ToastMessage } from "@/src/app/dashboard/jersey/page";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { BiddingData } from "../dashboard/jersey/types";

interface BiddingList {
  biddings: BiddingData;
  // setBiddings: React.Dispatch<React.SetStateAction<Bidding[]>>;
  // updateUser: () => void;
  // setToast: React.Dispatch<React.SetStateAction<ToastMessage>>;
  // handleOpen: () => void;
}

const axios = require("axios");
const axiosWithCredentials = axios.create({
  withCredentials: true,
});

// User submit bid form
const BiddingTable: React.FC<BiddingList> = ({ biddings }) => {


  const [open, setOpen] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [bids, setBids] = useState<Bids>({})
  const [newBid, setNewBid] = useState('')

  const handleOpenModal = (number: number) => {
    setOpen(true)
  }

  const handlePlaceBid = () => {
    if (selectedNumber && newBid ) {
      const updatedBids = { ...bids }
      if (!updatedBids[selectedNumber]) {
        updatedBids[selectedNumber] = []
      }
      setBids(updatedBids)
      setNewBid('')
    }
  }

  // const deleteBid = (ind: number) => {
  //   const filteredList = biddings.filter(bidding => bidding.number != biddings[ind].number);
  //   setBiddings(filteredList);
  // };

  // Currently unable to make the api call
  // const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axiosWithCredentials.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bid/create`, {
  //       bids: biddings,
  //     });

  //     if (response.data.success) {
  //       setToast({ message: "Bids submitted", severity: "success" });
  //       handleOpen();
  //       updateUser();
  //     } else {
  //       console.error("Bids failed");
  //       setToast({ message: "Bids failed to be submitted", severity: "error" });
  //       handleOpen();
  //     }
  //   } catch (error) {
  //     console.error("Error during form submission", error);
  //   }
  // };

  return (
    /*<div>
      <div className="flex items-center justify-between space-x-4 py-2">
        <h2 className="py-2 text-xl font-semibold">Submit new bids:</h2>
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
    <h1 className="text-2xl font-bold mb-4">Bidding Table</h1>
    <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((number) => (
        <Button
        key={number}
        onClick={() => handleOpenModal(number)}
        variant="outline"
        className="h-12 w-full"
      >
        {number}
      </Button>
      ))}
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="w-full max-w-lg">
              <DialogHeader>
          <DialogTitle>Bids for Number {selectedNumber}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Room Number</TableHead>
                <TableHead className="w-1/2">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedNumber && bids[selectedNumber] && bids[selectedNumber].map((bid, index) => (
                <TableRow key={index}>
                  <TableCell>{bid.user}</TableCell>
                  <TableCell>${bid.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {(!selectedNumber || !bids[selectedNumber] || bids[selectedNumber].length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No bids yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
  <Button  className="w-full sm:w-auto">Place Bid</Button>
</DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
  );
};

export default BiddingTable;
