import api from './api';

class PrescriptionService {
  // Get all prescriptions
  async getAllPrescriptions(params = {}) {
    try {
      const response = await api.get('/prescriptions', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch prescriptions'
      };
    }
  }

  // Get prescription by ID
  async getPrescriptionById(id) {
    try {
      const response = await api.get(`/prescriptions/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch prescription'
      };
    }
  }

  // Create prescription
  async createPrescription(prescriptionData) {
    try {
      console.log('PrescriptionService: Creating prescription with data:', prescriptionData);
      const response = await api.post('/prescriptions', prescriptionData);
      console.log('PrescriptionService: Success response:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('PrescriptionService: Error creating prescription:', error);
      console.error('PrescriptionService: Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create prescription',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update prescription
  async updatePrescription(id, prescriptionData) {
    try {
      const response = await api.put(`/prescriptions/${id}`, prescriptionData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update prescription',
        errors: error.response?.data?.errors
      };
    }
  }

  // Cancel prescription
  async cancelPrescription(id, reason) {
    try {
      const response = await api.patch(`/prescriptions/${id}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel prescription'
      };
    }
  }

  // Get available medications
  async getAvailableMedications(params = {}) {
    try {
      const response = await api.get('/prescriptions/medications/available', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available medications'
      };
    }
  }

  // Get prescriptions for patient
  async getPrescriptionsForPatient(patientId, params = {}) {
    try {
      const response = await api.get('/prescriptions', { 
        params: { ...params, patientId } 
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient prescriptions'
      };
    }
  }

  // Get my prescriptions (for patients)
  async getMyPrescriptions(params = {}) {
    try {
      const response = await api.get('/prescriptions', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch prescriptions'
      };
    }
  }
}

export default new PrescriptionService();