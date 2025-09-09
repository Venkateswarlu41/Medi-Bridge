import api from "./api";

class LabTestService {
  // Get all lab tests
  async getAllLabTests(params = {}) {
    try {
      const response = await api.get("/lab-tests", { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch lab tests",
      };
    }
  }

  // Get lab test by ID
  async getLabTestById(id) {
    try {
      const response = await api.get(`/lab-tests/${id}`);
      console.log("Lab test service response:", response);

      // Ensure we have the data we need
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format from server");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Lab test service error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch lab test",
        error: error.message,
      };
    }
  }

  // Create lab test request
  async createLabTest(testData) {
    try {
      console.log("LabTestService: Creating lab test with data:", testData);
      const response = await api.post("/lab-tests", testData);
      console.log("LabTestService: Success response:", response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("LabTestService: Error creating lab test:", error);
      console.error("LabTestService: Error response:", error.response?.data);
      console.error("LabTestService: Error status:", error.response?.status);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create lab test request",
        errors: error.response?.data?.errors,
      };
    }
  }

  // Update lab test status
  async updateLabTestStatus(id, status) {
    try {
      const response = await api.patch(`/lab-tests/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update lab test status",
      };
    }
  }

  // Upload lab test results
  async uploadLabResults(id, resultsData) {
    try {
      let response;

      // Check if resultsData is FormData (for image upload)
      if (resultsData instanceof FormData) {
        response = await api.post(`/lab-tests/${id}/results`, resultsData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Regular JSON data
        response = await api.post(`/lab-tests/${id}/results`, resultsData);
      }

      console.log("Upload response:", response);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Upload lab results error:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to upload lab results",
        errors: error.response?.data?.errors,
      };
    }
  }

  // Review lab test (for doctors)
  async reviewLabTest(id, reviewData) {
    try {
      const response = await api.post(`/lab-tests/${id}/review`, reviewData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to review lab test",
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get lab tests for appointment
  async getLabTestsForAppointment(appointmentId) {
    try {
      const response = await api.get(`/lab-tests/appointment/${appointmentId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch lab tests for appointment",
      };
    }
  }

  // Get my lab tests (for patients)
  async getMyLabTests(params = {}) {
    try {
      const response = await api.get("/lab-tests", { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch lab tests",
      };
    }
  }

  // Get lab tests assigned to me (for lab technicians)
  async getAssignedLabTests(params = {}) {
    try {
      const response = await api.get("/lab-tests", { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch assigned lab tests",
      };
    }
  }

  // Get all lab technicians (for admin)
  async getAllLabTechnicians(params = {}) {
    try {
      const response = await api.get("/lab-tests/technicians/all", { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch lab technicians",
      };
    }
  }

  // Get available lab technicians
  async getAvailableLabTechnicians(departmentId = null) {
    try {
      const params = departmentId ? { departmentId } : {};
      const response = await api.get("/lab-tests/technicians/available", {
        params,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch available lab technicians",
      };
    }
  }
}

export default new LabTestService();
