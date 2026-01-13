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
    if (!userId) return {};

    console.log(`Fetching cart items for: ${userId}`);
    const response = await axiosInstance.get(`/api/cart/${userId}`);
    
    // LOG THE ACTUAL RESPONSE so we can see what the backend is doing
    console.log("Raw cart response from server:", response.data);

    // Robust extraction: Handle single object, array, or direct items map
    const data = response.data;
    
    if (Array.isArray(data) && data.length > 0) {
        return data[0].items || {};
    }
    
    if (data && typeof data === 'object') {
        // If it's already the items map {product: qty}
        if (!data.items && !data.userId && Object.keys(data).length > 0) return data;
        // Otherwise return the items field
        return data.items || {};
    }

    return {};
  } catch (error) {
    console.error("Cart fetch error:", error.response?.status, error.response?.data || error.message);
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