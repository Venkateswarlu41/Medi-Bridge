import api from './api';

class DoctorService {
  // Get all doctors
  async getAllDoctors(params = {}) {
    try {
      const response = await api.get('/doctors', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctors'
      };
    }
  }

  // Get doctor by ID
  async getDoctorById(id) {
    try {
      const response = await api.get(`/doctors/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor'
      };
    }
  }

  // Get doctor dashboard
  async getDoctorDashboard() {
    try {
      const response = await api.get('/doctors/dashboard');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  }

  // Get doctor schedule
  async getDoctorSchedule(id, params = {}) {
    try {
      const response = await api.get(`/doctors/${id}/schedule`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor schedule'
      };
    }
  }

  // Get doctor patients
  async getDoctorPatients(id, params = {}) {
    try {
      const response = await api.get(`/doctors/${id}/patients`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor patients'
      };
    }
  }

  // Create doctor
  async createDoctor(doctorData) {
    try {
      const response = await api.post('/doctors', doctorData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create doctor',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update doctor
  async updateDoctor(id, doctorData) {
    try {
      const response = await api.put(`/doctors/${id}`, doctorData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update doctor',
        errors: error.response?.data?.errors
      };
    }
  }

  // Delete doctor
  async deleteDoctor(id) {
    try {
      const response = await api.delete(`/doctors/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete doctor'
      };
    }
  }

  // Update doctor availability
  async updateDoctorAvailability(id, availability) {
    try {
      const response = await api.patch(`/doctors/${id}/availability`, availability);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update doctor availability'
      };
    }
  }

  // Get doctor statistics
  async getDoctorStats(id, params = {}) {
    try {
      const response = await api.get(`/doctors/${id}/stats`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor statistics'
      };
    }
  }
}

export default new DoctorService();