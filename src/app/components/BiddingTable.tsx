import React from "react";

import type { ToastMessage } from "@/src/app/dashboard/jersey/page";

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
    <div>
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
          )} */}
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
              {/* <td className="whitespace-no-wrap px-6 py-4">{bidding.number}</td> */}
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
    </div>
  );
};

export default BiddingTable;
