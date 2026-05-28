import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing token to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request to retry after token refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // In a real app, you'd call a refresh token endpoint here
      // For now, we'll just clear auth and redirect
      localStorage.removeItem('token');
      processQueue(error, null);
      isRefreshing = false;

      // Trigger logout by dispatching custom event
      window.dispatchEvent(new Event('auth:logout'));

      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      const message = errorData?.message || 'An error occurred';

      // Create enhanced error object
      error.message = message;
      error.statusCode = error.response.status;
    } else if (error.request) {
      // Request was made but no response
      error.message = 'No response from server';
      error.statusCode = 0;
    } else {
      // Error in request setup
      error.message = error.message || 'Error occurred';
      error.statusCode = 0;
    }

    return Promise.reject(error);
  }
);

export default api;
