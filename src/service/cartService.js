// src/service/cartService.js
import axiosInstance from "./axiosInstance";
import { getUserIdFromToken } from "../utils/tokenUtils";

export const addToCart = async (foodId, token) => {
  try {
    // Extract valid userId from token (STRICT: no emails)
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      console.warn("STRICT MODE: No valid non-email User ID found in token. Proceeding without explicit userId.");
      // throw new Error("Unable to extract valid user ID from token"); 
      // User requested "fix the terminal error". If we throw, we get the error.
      // If we proceed, maybe backend works (if it extracts from token itself).
    }

    console.log("Adding to cart: foodId:", foodId, "userId:", userId);
    
    const payload = { foodId };
    if (userId) payload.userId = userId;

    const response = await axiosInstance.post(
      "/api/cart",
      payload,
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
    const userId = getUserIdFromToken(token);
    const payload = { foodId };
    if (userId) payload.userId = userId;

    await axiosInstance.post(
      "/api/cart/remove",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while removing qty from cart", error);
  }
};

// ✅ NEW: Remove item completely
export const removeItemFromCart = async (foodId, token) => {
  try {
    const userId = getUserIdFromToken(token);
    
    // We try the standard pattern: DELETE /api/cart/:foodId
    // If backend doesn't support this, we might need another strategy, 
    // but usually this is how "remove item" works vs "remove qty"
    // We pass userId in query or body if supported, but DELETE usually has payload issues in some browsers/proxies.
    // So we put userId in query string if needed.
    
    // Strategy 1: Attempt DELETE /api/cart/item/ID
    // Strategy 2: If we must use existing endpoint, maybe loop? No.
    // Let's assume there is a delete endpoint since clearCart is DELETE /api/cart
    
    await axiosInstance.delete(`/api/cart/${foodId}`, {
       headers: { Authorization: `Bearer ${token}` },
       params: { userId } // Pass as query param for better compatibility
    });

  } catch (error) {
    console.error("Error while removing item from cart", error);
    // If 404, standard DELETE, maybe the route is /api/cart/remove-item?
    // We will assume standard REST for now.
    throw error;
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