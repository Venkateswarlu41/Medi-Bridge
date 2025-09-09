import api from './api';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      console.log('Registration data being sent:', userData);
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Registration error details:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        errors: error.response?.data?.errors
      };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        errors: error.response?.data?.errors
      };
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify-token');
      
      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  }

  // Get current token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return roles.includes(user?.role);
  }
}

export default new AuthService();