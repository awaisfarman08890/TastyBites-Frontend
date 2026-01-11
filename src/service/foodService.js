import axiosInstance from "./axiosInstance";

const API_URL = "https://tasty-bities-backend-production.up.railway.app/api/foods";

export const fetchFoodItems = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching food items:", error);
    throw error;
  }
};

export const fetchFoodDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching food details:", error);
    throw error;
  }
};
