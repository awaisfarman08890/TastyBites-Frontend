// src/service/cartService.js
import axiosInstance from "./axiosInstance";
import { getUserEmailFromToken } from "../utils/tokenUtils";

export const addToCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    await axiosInstance.post("/api/cart/add", { foodId, userId });
  } catch (error) {
    console.error("Add failed:", error);
    throw error;
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    await axiosInstance.post("/api/cart/remove-unit", { foodId, userId });
  } catch (error) {
    console.error("Remove unit failed:", error);
    throw error;
  }
};

export const removeItemFromCart = async (foodId, token) => {
  try {
    const userId = getUserEmailFromToken(token);
    // Use POST instead of DELETE to ensure the userId/foodId reach the server safely
    await axiosInstance.post("/api/cart/delete-item", { foodId, userId });
  } catch (error) {
    console.error("Delete item failed:", error);
    throw error;
  }
};

export const getCartData = async (token) => {
  try {
    const userId = getUserEmailFromToken(token);
    const response = await axiosInstance.get(`/api/cart/${userId}`);
    return response.data?.items || {};
  } catch (error) {
    console.error("Load cart failed:", error);
    return {};
  }
};

export const clearCart = async (token) => {
  try {
    const userId = getUserEmailFromToken(token);
    await axiosInstance.post("/api/cart/clear", { userId });
  } catch (error) {
    console.error("Clear cart failed:", error);
    throw error;
  }
};