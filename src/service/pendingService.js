import axiosInstance from "./axiosInstance";

// Fetch pending orders
export const fetchPendingOrders = async (userId) => {
  try {
    const res = await axiosInstance.get(
      `/api/orders/pending?userId=${userId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    throw error;
  }
};

// Retry payment for a pending order
export const retryPayment = async (orderId) => {
  try {
    const res = await axiosInstance.patch(
      `/api/orders/retry-payment/${orderId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error retrying payment:", error);
    throw error;
  }
};
