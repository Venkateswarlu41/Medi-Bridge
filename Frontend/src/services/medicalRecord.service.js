import api from './api';

class MedicalRecordService {
  // Get all medical records
  async getAllMedicalRecords(params = {}) {
    try {
      const response = await api.get('/medical-records', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical records'
      };
    }
  }

  // Get medical record by ID
  async getMedicalRecordById(id) {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical record'
      };
    }
  }

  // Create medical record
  async createMedicalRecord(recordData) {
    try {
      const response = await api.post('/medical-records', recordData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create medical record',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update medical record
  async updateMedicalRecord(id, recordData) {
    try {
      const response = await api.put(`/medical-records/${id}`, recordData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update medical record',
        errors: error.response?.data?.errors
      };
    }
  }

  // Delete medical record
  async deleteMedicalRecord(id) {
    try {
      const response = await api.delete(`/medical-records/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete medical record'
      };
    }
  }

  // Get medical records by patient
  async getMedicalRecordsByPatient(patientId, params = {}) {
    try {
      const response = await api.get(`/medical-records/patient/${patientId}`, { params });
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

  // Get medical records by doctor
  async getMedicalRecordsByDoctor(doctorId, params = {}) {
    try {
      const response = await api.get(`/medical-records/doctor/${doctorId}`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor medical records'
      };
    }
  }

  // Add diagnosis to medical record
  async addDiagnosis(recordId, diagnosisData) {
    try {
      const response = await api.post(`/medical-records/${recordId}/diagnosis`, diagnosisData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add diagnosis',
        errors: error.response?.data?.errors
      };
    }
  }

  // Add prescription to medical record
  async addPrescription(recordId, prescriptionData) {
    try {
      const response = await api.post(`/medical-records/${recordId}/prescription`, prescriptionData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add prescription',
        errors: error.response?.data?.errors
      };
    }
  }

  // Add lab test to medical record
  async addLabTest(recordId, labTestData) {
    try {
      const response = await api.post(`/medical-records/${recordId}/lab-test`, labTestData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add lab test',
        errors: error.response?.data?.errors
      };
    }
  }

  // Upload file to medical record
  async uploadFile(recordId, fileData) {
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('type', fileData.type);
      formData.append('description', fileData.description);

      const response = await api.post(`/medical-records/${recordId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      };
    }
  }

  // Get my medical records (for patients)
  async getMyMedicalRecords(params = {}) {
    try {
      const response = await api.get('/medical-records', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical records'
      };
    }
  }

  // Get my medical history (for patients)
  async getMyMedicalHistory() {
    try {
      const response = await api.get('/medical-records/patient/me/history');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical history'
      };
    }
  }

  // Download medical record as PDF
  async downloadMedicalRecord(recordId) {
    try {
      const response = await api.get(`/medical-records/${recordId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `medical-record-${recordId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Medical record downloaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to download medical record'
      };
    }
  }
}

export default new MedicalRecordService();