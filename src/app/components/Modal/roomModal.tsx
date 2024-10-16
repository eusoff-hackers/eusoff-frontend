// import React, { useEffect, useState } from "react";

// import type { Bidding, ToastMessage } from "@/src/app/dashboard/jersey/page";

// interface ModalProps {
//   closeModal: () => void;
//   index: number;
//   points: number;
//   biddings: Bidding[];
//   setBiddings: React.Dispatch<React.SetStateAction<Bidding[]>>;
//   setToast: React.Dispatch<React.SetStateAction<ToastMessage>>;
//   handleOpen: () => void;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   currentList: any[];
// }

// interface User {
//   username: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   teams: any[];
//   points: number;
// }

// const axios = require("axios");
// axios.defaults.withCredentials = true;

// const Modal: React.FC<ModalProps> = ({
//   closeModal,
//   index,
//   points,
//   biddings,
//   setBiddings,
//   setToast,
//   handleOpen,
//   currentList,
// }) => {
//   const [bidders, setBidders] = useState(null);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const compareLists = (list: any[]): boolean => {
//     for (let i = 0; i < currentList.length; i++) {
//       for (let j = 0; j < list.length; j++) {
//         if (currentList[i].name == list[j].name) {
//           return true;
//         }
//       }
//     }
//     return false;
//   };

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const getNames = (list: any[]): string => {
//     const names: string[] = [];
//     for (let j = 0; j < list.length; j++) {
//       names.push(list[j].name);
//     }

//     return names.join(", ");
//   };

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const fetchList: any = async () => {
//     try {
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/info`);

//       if (response.data.success) {
//         await setBidders(response.data.data[index]);
//       }
//     } catch (error) {
//       console.error("Error during update", error);
//     }
//   };

//   useEffect(() => {
//     fetchList(index);
//   });

//   const createBid = (ind: number) => {
//     const duplicateArr = biddings.filter(bidding => bidding.number == ind);

//     if (duplicateArr.length !== 0) {
//       // Include a popup to tell user to not bid for duplicates
//       setToast({ message: "Cannot bid for duplicate numbers", severity: "error" });
//       handleOpen();
//       return;
//     }

//     if (biddings.length > 4) {
//       //number is 4 because when open modal for 5th number, will record 4 numbers in bidding
//       // Include a popup to tell user not to bid for more than 5 numbers
//       setToast({ message: "Cannot bid for more than 5 numbers", severity: "error" });
//       handleOpen();
//       return;
//     }

//     const newBidding: Bidding = {
//       number: ind,
//     };

//     setBiddings([...biddings, newBidding]);
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
//       <div className="relative z-10 w-max rounded-lg bg-white p-6">
//         <div className="flex content-between">
//           <h2 className="mb-4 py-2 text-2xl font-semibold">Bidding List</h2>
//           <button
//             className="absolute right-2 top-2 ml-3 cursor-pointer text-gray-600 hover:text-red-500"
//             onClick={closeModal}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//         {bidders != null && (
//           <div className="mb-4">
//             <div className="mb-2 flex flex-row space-x-4">
//               <div>Male Quota: {bidders.quota.Male}</div>
//               <div>Female Quota: {bidders.quota.Female}</div>
//             </div>
//             {bidders.Male.length > 0 || bidders.Female.length > 0 ? (
//               <table className="min-w-full border-collapse border border-gray-300">
//                 <tbody>
//                   <tr className="bg-gray-100">
//                     <th className="px-4 py-2">Category</th>
//                     <th className="px-4 py-2">Name</th>
//                     <th className="px-4 py-2">Points</th>
//                     <th className="px-4 py-2">Sports</th>
//                   </tr>

//                   {Object.keys(bidders)
//                     .filter(category => category == "Male" || category == "Female")
//                     .map(
//                       (category, index: number) =>
//                         bidders[category].length > 0 && (
//                           <>
//                             <tr key={index}>
//                               <td className="px-4 py-2 font-bold">{category}</td>
//                               <td className="px-4 py-2"></td>
//                               <td className="px-4 py-2"></td>
//                             </tr>
//                             {bidders[category].map((item: User, subIndex: number) => (
//                               <tr
//                                 className={`mx-2 text-${compareLists(item.teams) ? "red" : "black"}-500`}
//                                 key={subIndex}
//                               >
//                                 <td className="px-4 py-2"></td>
//                                 <td className="px-4 py-2">{item.username}</td>
//                                 <td className="px-4 py-2">{item.points}</td>
//                                 <td className="px-4 py-2">{getNames(item.teams)}</td>
//                               </tr>
//                             ))}
//                           </>
//                         ),
//                     )}
//                 </tbody>
//               </table>
//             ) : (
//               <p> No Bids Found!!!</p>
//             )}
//           </div>
//         )}
//         <div className="grid grid-flow-row-dense grid-cols-2 grid-rows-1">
//           <h3 className=""> Current Points : {points}</h3>
//           <button
//             className="rounded bg-blue-500 px-2 py-2 text-white hover:bg-blue-600"
//             onClick={() => {
//               createBid(index);
//               closeModal();
//             }}
//           >
//             Bid
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;
