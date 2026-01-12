import axiosInstance from "./axiosInstance";

export const fetchFoodItems = async () => {
  try {
    const response = await axiosInstance.get("/foods");
    return response.data;
  } catch (error) {
    console.error("Error fetching food items:", error.response || error.message);
    throw error;
  }
};

export const fetchFoodDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/foods/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching food details:", error.response || error.message);
    throw error;
  }
};
