// src/service/cartService.js
import axiosInstance from "./axiosInstance";

export const addToCart = async (foodId, token) => {
  try {
    // Backend extracts userId from JWT token - DO NOT send userId manually
    console.log("Adding to cart: foodId:", foodId);
    
    const response = await axiosInstance.post(
      "/api/cart",
      { foodId },
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
    await axiosInstance.post(
      "/api/cart/remove",
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while removing qty from cart", error);
  }
};

// ✅ NEW: Remove item completely
export const removeItemFromCart = async (foodId, token) => {
  try {
    // We rely solely on the token for user identification to avoid 403 Forbidden
    // (Backend likely rejects explicit userId injection or body parsing issues in DELETE)
    
    await axiosInstance.delete(`/api/cart/${foodId}`, {
       headers: { Authorization: `Bearer ${token}` }
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