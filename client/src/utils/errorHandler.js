/**
 * Extract and normalize error messages from API responses
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.statusCode === 0) {
    return 'Network error. Please check your connection.';
  }

  return 'An unexpected error occurred';
};

/**
 * Get validation errors from response
 */
export const getValidationErrors = (error) => {
  const errors = {};

  if (error?.response?.data?.errors) {
    // If errors is an array, convert to object
    if (Array.isArray(error.response.data.errors)) {
      error.response.data.errors.forEach((err) => {
        errors[err.field || 'general'] = err.message;
      });
    } else {
      // If already an object, return as is
      return error.response.data.errors;
    }
  }

  return errors;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error) => {
  return !error?.response && error?.request;
};

/**
 * Check if error is a validation error (422)
 */
export const isValidationError = (error) => {
  return error?.response?.status === 422;
};

/**
 * Check if error is unauthorized (401)
 */
export const isUnauthorizedError = (error) => {
  return error?.response?.status === 401;
};

/**
 * Check if error is forbidden (403)
 */
export const isForbiddenError = (error) => {
  return error?.response?.status === 403;
};

/**
 * Check if error is not found (404)
 */
export const isNotFoundError = (error) => {
  return error?.response?.status === 404;
};

/**
 * Check if error is server error (5xx)
 */
export const isServerError = (error) => {
  return error?.response?.status >= 500;
};
