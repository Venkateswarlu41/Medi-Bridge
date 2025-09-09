import axios from "axios";

const ML_API_BASE_URL = "http://localhost:5001";

// Create axios instance for ML API
const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  // Increase timeout for image processing
  timeout: 30000,
});

export const predictDisease = async (disease, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    console.log(`Sending request to ${ML_API_BASE_URL}/predict/${disease}`);
    const response = await mlApi.post(`/predict/${disease}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Add withCredentials for CORS
      withCredentials: false,
    });
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in disease prediction:", error);
    if (error.code === "ECONNABORTED") {
      return { error: "Request timed out. Please try again." };
    }
    if (!error.response) {
      return {
        error: "Network error. Please check your connection and try again.",
      };
    }
    return {
      error: error.response?.data?.error || error.message,
      details: error.response?.data || "Unknown error occurred",
    };
  }
};
