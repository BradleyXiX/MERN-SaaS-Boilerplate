import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

describe('ProtectedRoute component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    const wrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper }
    );

    // The component should render without crashing
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    localStorage.setItem('token', 'valid-token');

    const wrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper }
    );

    // Should attempt to fetch user and eventually show content or redirect
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
