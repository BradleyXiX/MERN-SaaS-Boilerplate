/**
 * Unit tests for error handler middleware
 */

const { errorHandler } = require('../middleware/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should handle errors with custom message', () => {
    const error = new Error('Test error');
    error.statusCode = 400;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: 'Test error',
      })
    );
  });

  it('should default to 500 status code if not provided', () => {
    const error = new Error('Internal error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
      })
    );
  });

  it('should include error details in development mode', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Dev error');
    error.statusCode = 400;

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Object),
      })
    );
  });
});
