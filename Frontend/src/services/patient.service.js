import api from './api';

class PatientService {
  // Get all patients
  async getAllPatients(params = {}) {
    try {
      const response = await api.get('/patients', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patients'
      };
    }
  }

  // Get patient by ID
  async getPatientById(id) {
    try {
      const response = await api.get(`/patients/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient'
      };
    }
  }

  // Update patient
  async updatePatient(id, patientData) {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update patient',
        errors: error.response?.data?.errors
      };
    }
  }

  // Add vital signs
  async addVitalSigns(id, vitalData) {
    try {
      const response = await api.post(`/patients/${id}/vital-signs`, vitalData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add vital signs',
        errors: error.response?.data?.errors
      };
    }
  }

  // Get patient history
  async getPatientHistory(id) {
    try {
      const response = await api.get(`/patients/${id}/history`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient history'
      };
    }
  }

  // Add patient note
  async addPatientNote(id, noteData) {
    try {
      const response = await api.post(`/patients/${id}/notes`, noteData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add note',
        errors: error.response?.data?.errors
      };
    }
  }

  // Create patient
  async createPatient(patientData) {
    try {
      const response = await api.post('/patients', patientData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create patient',
        errors: error.response?.data?.errors
      };
    }
  }

  // Delete patient
  async deletePatient(id) {
    try {
      const response = await api.delete(`/patients/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete patient'
      };
    }
  }

  // Get patient appointments
  async getPatientAppointments(id, params = {}) {
    try {
      const response = await api.get(`/patients/${id}/appointments`, { params });
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

  // Get patient medical records
  async getPatientMedicalRecords(id, params = {}) {
    try {
      const response = await api.get(`/patients/${id}/medical-records`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient medical records'
      };
    }
  }

  // Get patient billing records
  async getPatientBillingRecords(id, params = {}) {
    try {
      const response = await api.get(`/patients/${id}/billing`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient billing records'
      };
    }
  }

  // Search patients
  async searchPatients(query) {
    try {
      const response = await api.get('/patients/search', { params: { q: query } });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search patients'
      };
    }
  }
}

export default new PatientService();