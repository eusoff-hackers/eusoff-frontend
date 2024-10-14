import axios from "axios";

axios.defaults.withCredentials = true;

// Does a call for User's bidding info
export const getUserBiddings = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jersey/info`);

    console.log("response", response.data.data);

    if (response.data.success) {
      // console.log("This is eligible bids" + JSON.stringify(response.data.data));
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
      console.log("This is eligible bids" + JSON.stringify(response.data.data));
      return response.data.data;
    }
  } catch (error) {
    console.error("Error during getting user bids", error);
  }
};
