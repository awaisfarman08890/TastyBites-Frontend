// src/service/cartService.js
import axiosInstance from "./axiosInstance";
import { getUserIdFromToken } from "../utils/tokenUtils";

export const addToCart = async (foodId, token) => {
  try {
    // Extract userId from token to ensure backend uses userId, not email
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      throw new Error("Unable to extract user ID from token");
    }



    console.log("Adding to cart with userId:", userId, "foodId:", foodId);
    
    await axiosInstance.post(
      "/api/cart",
      { foodId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error adding food:", error);
    throw error;
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    // Extract userId from token to ensure backend uses userId, not email
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      throw new Error("Unable to extract user ID from token");
    }



    await axiosInstance.post(
      "/api/cart/remove",
      { foodId, userId },
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