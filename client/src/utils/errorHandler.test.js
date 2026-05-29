import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  isNetworkError,
  isValidationError,
  isUnauthorizedError,
  isServerError,
} from '../utils/errorHandler';

describe('errorHandler utilities', () => {
  describe('getErrorMessage', () => {
    it('should return string if input is string', () => {
      expect(getErrorMessage('Error message')).toBe('Error message');
    });

    it('should extract message from response data', () => {
      const error = {
        response: {
          data: {
            message: 'Server error',
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Server error');
    });

    it('should use error.message if response message is not available', () => {
      const error = {
        message: 'Request failed',
      };
      expect(getErrorMessage(error)).toBe('Request failed');
    });

    it('should return network error message for statusCode 0', () => {
      const error = {
        statusCode: 0,
      };
      expect(getErrorMessage(error)).toBe('Network error. Please check your connection.');
    });

    it('should return default message if no error details available', () => {
      const error = {};
      expect(getErrorMessage(error)).toBe('An unexpected error occurred');
    });
  });

  describe('error type checking', () => {
    it('should identify network errors', () => {
      const networkError = {
        request: {},
      };
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('should identify validation errors (422)', () => {
      const validationError = {
        response: {
          status: 422,
        },
      };
      expect(isValidationError(validationError)).toBe(true);
    });

    it('should identify unauthorized errors (401)', () => {
      const unauthorizedError = {
        response: {
          status: 401,
        },
      };
      expect(isUnauthorizedError(unauthorizedError)).toBe(true);
    });

    it('should identify server errors (5xx)', () => {
      const serverError = {
        response: {
          status: 500,
        },
      };
      expect(isServerError(serverError)).toBe(true);
    });
  });
});
