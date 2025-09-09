import api from './api';

class PharmacyService {
  // Get all medications
  async getAllMedications(params = {}) {
    try {
      const response = await api.get('/pharmacy/medications', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medications'
      };
    }
  }

  // Get medication by ID
  async getMedicationById(id) {
    try {
      const response = await api.get(`/pharmacy/medications/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medication'
      };
    }
  }

  // Create medication
  async createMedication(medicationData) {
    try {
      const response = await api.post('/pharmacy/medications', medicationData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create medication',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update medication
  async updateMedication(id, medicationData) {
    try {
      const response = await api.put(`/pharmacy/medications/${id}`, medicationData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update medication',
        errors: error.response?.data?.errors
      };
    }
  }

  // Delete medication
  async deleteMedication(id) {
    try {
      const response = await api.delete(`/pharmacy/medications/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete medication'
      };
    }
  }

  // Get all prescriptions
  async getAllPrescriptions(params = {}) {
    try {
      const response = await api.get('/pharmacy/prescriptions', { params });
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
      const response = await api.get(`/pharmacy/prescriptions/${id}`);
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
      const response = await api.post('/pharmacy/prescriptions', prescriptionData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
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
      const response = await api.put(`/pharmacy/prescriptions/${id}`, prescriptionData);
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

  // Fulfill prescription
  async fulfillPrescription(id, fulfillmentData) {
    try {
      const response = await api.post(`/pharmacy/prescriptions/${id}/fulfill`, fulfillmentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fulfill prescription',
        errors: error.response?.data?.errors
      };
    }
  }

  // Get prescriptions by patient
  async getPrescriptionsByPatient(patientId, params = {}) {
    try {
      const response = await api.get(`/pharmacy/prescriptions/patient/${patientId}`, { params });
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

  // Get prescriptions by doctor
  async getPrescriptionsByDoctor(doctorId, params = {}) {
    try {
      const response = await api.get(`/pharmacy/prescriptions/doctor/${doctorId}`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor prescriptions'
      };
    }
  }

  // Check drug interactions
  async checkDrugInteractions(medications) {
    try {
      const response = await api.post('/pharmacy/check-interactions', { medications });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check drug interactions'
      };
    }
  }

  // Get inventory status
  async getInventoryStatus(params = {}) {
    try {
      const response = await api.get('/pharmacy/inventory', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inventory status'
      };
    }
  }

  // Update inventory
  async updateInventory(medicationId, inventoryData) {
    try {
      const response = await api.put(`/pharmacy/inventory/${medicationId}`, inventoryData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inventory',
        errors: error.response?.data?.errors
      };
    }
  }
}

export default new PharmacyService();