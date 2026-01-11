import axiosInstance from "./axiosInstance";

// pending orders lana
export const fetchPendingOrders = async (userId) => {
  const res = await axiosInstance.get(
    `/api/orders/pending?userId=${userId}`
  );
  return res.data;
};

// payment retry karna
export const retryPayment = async (orderId) => {
  const res = await axiosInstance.patch(
    `/api/orders/retry-payment/${orderId}`
  );
  return res.data;
};
