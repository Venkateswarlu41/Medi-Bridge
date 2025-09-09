import api from './api';

class DepartmentService {
  // Get all departments
  async getAllDepartments() {
    try {
      const response = await api.get('/departments');
      
      if (response.data.success) {
        return { success: true, departments: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch departments'
      };
    }
  }

  // Get department by ID
  async getDepartmentById(id) {
    try {
      const response = await api.get(`/departments/${id}`);
      
      if (response.data.success) {
        return { success: true, department: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch department'
      };
    }
  }

  // Get departments for public use (during registration)
  async getPublicDepartments() {
    try {
      // Try public endpoint first
      const response = await api.get('/departments/public');
      
      if (response.data.success) {
        return { success: true, departments: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Failed to fetch public departments:', error);
      // If public endpoint fails, return graceful fallback
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch departments'
      };
    }
  }

  // Seed default departments
  async seedDepartments() {
    try {
      const response = await api.post('/departments/seed');
      
      if (response.data.success) {
        return { success: true, departments: response.data.data, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Failed to seed departments:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to seed departments'
      };
    }
  }
}

export default new DepartmentService();