import api from './api';

const dashboardService = {
  // Get admin dashboard data
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/admin');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch admin dashboard data'
      };
    }
  },

  // Get patient dashboard data
  getPatientDashboard: async () => {
    try {
      const response = await api.get('/dashboard/patient');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient dashboard data'
      };
    }
  },

  // Get doctor dashboard data (already exists in doctor.service.js)
  getDoctorDashboard: async () => {
    try {
      const response = await api.get('/doctors/dashboard');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor dashboard data'
      };
    }
  },

  // Get pharmacy statistics
  getPharmacyStats: async () => {
    try {
      const response = await api.get('/dashboard/pharmacy');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pharmacy statistics'
      };
    }
  }
};

export default dashboardService;