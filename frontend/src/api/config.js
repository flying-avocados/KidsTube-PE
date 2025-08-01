import axios from 'axios';

// Use production URL when deployed, localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://kidstubepe.andrew.cmu.edu:5000/api'
  : (process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/landing';
    }
    return Promise.reject(error);
  }
);

export default api; 