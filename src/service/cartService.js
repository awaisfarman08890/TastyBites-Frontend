// src/service/cartService.js
import axiosInstance from "./axiosInstance";
import { getUserEmailFromToken } from "../utils/tokenUtils";

export const addToCart = async (foodId, token) => {
  try {
    // Explicitly send the email as userId to help the backend 'upsert' rather than duplicate
    const userId = getUserEmailFromToken(token);
    console.log("Adding to cart: foodId:", foodId, "userId:", userId);
    
    const response = await axiosInstance.post(
      "/api/cart",
      { foodId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Add to cart response:", response.data);
  } catch (error) {
    console.error("Error adding food:", error.response?.data || error.message);
    throw error;
  }
};

// Remove single unit
export const removeQtyFromCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    await axiosInstance.post(
      "/api/cart/remove",
      { foodId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while removing qty from cart", error);
  }
};

// ✅ FIX: Using params to avoid 403 and passing userId explicitly
export const removeItemFromCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    
    // Some backends reject DELETE with body but accept query params for identification
    await axiosInstance.delete(`/api/cart/${foodId}`, {
       headers: { Authorization: `Bearer ${token}` },
       params: { userId } 
    });

  } catch (error) {
    console.error("Error while removing item from cart", error);
    throw error;
  }
};

export const getCartData = async (token) => {
  try {
    const response = await axiosInstance.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle both single cart object and array of carts (merging items if duplicates exist)
    const data = response.data;
    if (Array.isArray(data)) {
      console.warn("Backend returned multiple cart documents. Merging items...");
      const mergedItems = {};
      data.forEach(cart => {
        if (cart.items) {
          Object.entries(cart.items).forEach(([prodId, qty]) => {
            mergedItems[prodId] = (mergedItems[prodId] || 0) + qty;
          });
        }
      });
      return mergedItems;
    }

    // backend returns CartResponse { items: { foodId: qty } }
    return data?.items || {};
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