import api from './config';

export const authAPI = {
  // Register a new user
  register: async (userData) => {
    // If userData is FormData (for file uploads), don't set Content-Type
    const config = userData instanceof FormData ? {} : {};
    const response = await api.post('/auth/register', userData, config);
    console.log('sending request to register user');
    return response.data;
  },

  // Login user (legacy - kept for backward compatibility)
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Child login - uses parent's email and password
  loginChild: async (credentials) => {
    const response = await api.post('/auth/login/child', credentials);
    return response.data;
  },

  // Parent login - requires email, password, and six digit code
  loginParent: async (credentials) => {
    const response = await api.post('/auth/login/parent', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
}; 