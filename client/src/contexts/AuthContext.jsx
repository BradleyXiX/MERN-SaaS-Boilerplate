import { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      // Fetch current user
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async (authToken) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // Clear auth if token is invalid
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/register', { email, password, name });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Request failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/reset-password', { token, password });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Reset failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Methods
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
