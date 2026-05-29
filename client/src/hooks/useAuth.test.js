import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthContext';

describe('useAuth hook', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should throw error when used outside of AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: expect.any(Boolean),
        error: null,
      })
    );
  });

  it('should have auth methods available', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.signup).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.forgotPassword).toBe('function');
    expect(typeof result.current.resetPassword).toBe('function');
    expect(typeof result.current.verifyEmail).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
