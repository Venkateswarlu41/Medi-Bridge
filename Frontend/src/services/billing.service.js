import api from './api';

class BillingService {
  // Get all bills
  async getAllBills(params = {}) {
    try {
      const response = await api.get('/billing', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch bills'
      };
    }
  }

  // Get bill by ID
  async getBillById(id) {
    try {
      const response = await api.get(`/billing/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch bill'
      };
    }
  }

  // Create bill
  async createBill(billData) {
    try {
      const response = await api.post('/billing', billData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create bill',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update bill
  async updateBill(id, billData) {
    try {
      const response = await api.put(`/billing/${id}`, billData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update bill',
        errors: error.response?.data?.errors
      };
    }
  }

  // Delete bill
  async deleteBill(id) {
    try {
      const response = await api.delete(`/billing/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete bill'
      };
    }
  }

  // Get bills by patient
  async getBillsByPatient(patientId, params = {}) {
    try {
      const response = await api.get(`/billing/patient/${patientId}`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient bills'
      };
    }
  }

  // Process payment
  async processPayment(billId, paymentData) {
    try {
      const response = await api.post(`/billing/${billId}/payment`, paymentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process payment',
        errors: error.response?.data?.errors
      };
    }
  }

  // Generate invoice
  async generateInvoice(billId) {
    try {
      const response = await api.get(`/billing/${billId}/invoice`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate invoice'
      };
    }
  }

  // Get payment history
  async getPaymentHistory(billId) {
    try {
      const response = await api.get(`/billing/${billId}/payments`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payment history'
      };
    }
  }

  // Apply insurance
  async applyInsurance(billId, insuranceData) {
    try {
      const response = await api.post(`/billing/${billId}/insurance`, insuranceData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply insurance',
        errors: error.response?.data?.errors
      };
    }
  }

  // Get billing statistics
  async getBillingStats(params = {}) {
    try {
      const response = await api.get('/billing/summary', { params });
      const summary = response.data.data.summary;
      
      // Map backend response to frontend expected format
      return {
        success: true,
        data: {
          totalRevenue: summary.totalAmount || 0,
          pendingAmount: summary.totalPending || 0,
          totalBills: summary.totalBills || 0,
          overdueAmount: summary.overdueBills || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch billing statistics'
      };
    }
  }
}

export default new BillingService();