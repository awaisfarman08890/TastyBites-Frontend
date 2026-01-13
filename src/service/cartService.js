// src/service/cartService.js
import axiosInstance from "./axiosInstance";
import { getUserIdFromToken } from "../utils/tokenUtils";

export const addToCart = async (foodId, token) => {
  try {
    // Rely on backend to extract userId from token
    console.log("Adding to cart: foodId:", foodId);
    
    const response = await axiosInstance.post(
      "/api/cart",
      { foodId }, // userId removed from payload
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Add to cart response:", response.data);
  } catch (error) {
    console.error("Error adding food:", error.response?.data || error.message);
    throw error;
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    // Rely on backend to extract userId from token
    await axiosInstance.post(
      "/api/cart/remove",
      { foodId }, // userId removed from payload
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