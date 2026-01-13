// src/service/cartService.js
import axiosInstance from "./axiosInstance";

/**
 * FIXED: Strictly following backend security requirements.
 * userId is extracted from JWT token on the backend.
 * DO NOT send userId manually from frontend.
 */

export const addToCart = async (foodId) => {
  try {
    // Send only foodId. Backend gets userId from token.
    const response = await axiosInstance.post("/api/cart", { foodId });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const removeQtyFromCart = async (foodId) => {
  try {
    // Send only foodId. Backend gets userId from token.
    const response = await axiosInstance.post("/api/cart/remove", { foodId });
    return response.data;
  } catch (error) {
    console.error("Error removing quantity:", error);
    throw error;
  }
};

export const removeItemFromCart = async (foodId) => {
  try {
    // DELETE /api/cart/{foodId}. Backend gets userId from token.
    const response = await axiosInstance.delete(`/api/cart/${foodId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
};

export const getCartData = async () => {
  try {
    // GET /api/cart. Backend returns CartEntity for authenticated user.
    const response = await axiosInstance.get("/api/cart");
    console.log("Cart data received:", response.data);
    
    // Extract items map from CartEntity { userId, items: { productId: qty }, ... }
    return response.data?.items || {};
  } catch (error) {
    console.error("Error fetching cart data:", error);
    return {};
  }
};

export const clearCart = async () => {
  try {
    // DELETE /api/cart. Backend clears cart for authenticated user.
    const response = await axiosInstance.delete("/api/cart");
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};