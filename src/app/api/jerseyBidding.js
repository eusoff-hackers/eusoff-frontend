import axios from "axios";

axios.defaults.withCredentials = true;

// Does a call for User's bidding info
export const getUserBiddings = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/info`);

    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Error during getting user bids", error);
  }
};

export const getUserEligibleBids = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/eligible`);

    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Error during getting user bids", error);
  }
};
