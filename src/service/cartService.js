// src/service/cartService.js
import axiosInstance from "./axiosInstance";
import { getUserEmailFromToken } from "../utils/tokenUtils";

export const addToCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    // Explicitly send userId in body for POST
    await axiosInstance.post("/api/cart", { foodId, userId });
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Remove single unit from cart
export const removeQtyFromCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    // Explicitly send userId in body for POST
    await axiosInstance.post("/api/cart/remove", { foodId, userId });
  } catch (error) {
    console.error("Error removing unit:", error);
    throw error;
  }
};

// Remove item completely
export const removeItemFromCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    // Use DELETE with userId as query param to avoid 403 body issues
    await axiosInstance.delete(`/api/cart/${foodId}`, {
       params: { userId } 
    });
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
};

export const getCartData = async (token) => {
  try {   
    const userId = getUserEmailFromToken(token);
    const response = await axiosInstance.get(`/api/cart/${userId}`);
    return response.data?.items || {};
  } catch (error) {
    console.error("Error fetching cart data:", error);
    return {};
  }
};

// Clear entire cart
export const clearCart = async (token) => {
  try {
    const userId = getUserEmailFromToken(token);
    // Use DELETE with userId as query param to avoid 403 body issues
    await axiosInstance.delete("/api/cart", {
       params: { userId } 
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};