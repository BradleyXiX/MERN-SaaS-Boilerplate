import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';

describe('ProtectedRoute component', () => {
  it('renders loading state when session check is in progress', () => {
    const mockContext = {
      user: null,
      loading: true,
      isAuthenticated: false,
    };

    const { container } = render(
      <AuthContext.Provider value={mockContext}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Confidential Dashboard</div>
          </ProtectedRoute>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Confidential Dashboard')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders children content when authenticated', () => {
    const mockContext = {
      user: { name: 'Admin', role: 'admin' },
      loading: false,
      isAuthenticated: true,
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Confidential Dashboard</div>
          </ProtectedRoute>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Confidential Dashboard')).toBeInTheDocument();
  });
});
