import axiosInstance from "./axiosInstance";

// REGISTER
export const registerUser = async (data) => {
  try {
    const response = await axiosInstance.post("/api/auth/register", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data; // backend ka data return
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// LOGIN
export const login = async (data) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
