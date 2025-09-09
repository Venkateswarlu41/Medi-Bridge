import api from './api';

class AppointmentService {
  // Get all appointments
  async getAllAppointments(params = {}) {
    try {
      const response = await api.get('/appointments', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments'
      };
    }
  }

  // Get appointment by ID
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointment'
      };
    }
  }

  // Create appointment
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create appointment',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update appointment
  async updateAppointment(id, appointmentData) {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment',
        errors: error.response?.data?.errors
      };
    }
  }

  // Cancel appointment
  async cancelAppointment(id, reason) {
    try {
      const response = await api.delete(`/appointments/${id}`, {
        data: { reason }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel appointment'
      };
    }
  }

  // Update appointment status
  async updateAppointmentStatus(id, status) {
    try {
      const response = await api.patch(`/appointments/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment status'
      };
    }
  }

  // Get doctor availability
  async getDoctorAvailability(doctorId, date) {
    try {
      const response = await api.get('/appointments/availability', {
        params: { doctorId, date }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor availability'
      };
    }
  }

  // Get my appointments (for patients)
  async getMyAppointments(params = {}) {
    try {
      const response = await api.get('/appointments/my', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch my appointments'
      };
    }
  }

  // Get appointments by doctor
  async getAppointmentsByDoctor(doctorId, params = {}) {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor appointments'
      };
    }
  }

  // Get appointments by patient
  async getAppointmentsByPatient(patientId, params = {}) {
    try {
      const response = await api.get(`/appointments/patient/${patientId}`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient appointments'
      };
    }
  }
}

export default new AppointmentService();