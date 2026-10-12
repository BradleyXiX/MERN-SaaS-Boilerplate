import { createContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Synchronize session from HttpOnly cookies via server /api/auth/me
  const checkSession = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Login failed';
      setError(detail);
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/register', { email, password, name });
      return { success: true, message: response.data.message };
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Registration failed';
      setError(detail);
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore network failures on logout
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Request failed';
      setError(detail);
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Password reset failed';
      setError(detail);
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/auth/verify-email?token=${token}`);
      return { success: true, message: response.data.message };
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Verification failed';
      setError(detail);
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
