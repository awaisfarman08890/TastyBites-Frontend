// src/service/cartService.js
import axiosInstance from "./axiosInstance";

export const addToCart = async (foodId, token) => {
  try {
    await axiosInstance.post(
      "/api/cart",
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while adding to cart", error);
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    await axiosInstance.post(
      "/api/cart/remove",
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while removing qty from cart", error);
  }
};

export const getCartData = async (token) => {
  try {
    const response = await axiosInstance.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // backend returns CartResponse { items: { foodId: qty } }
    return response.data?.items || {};
  } catch (error) {
    console.error("Error while fetching cart data", error);
    return {};
  }
};

// ✅ NEW: Clear entire cart function
export const clearCart = async (token) => {
  try {
    await axiosInstance.delete("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error while clearing cart", error);
    throw error;
  }
};