// Global Error Handling Middleware

// Express error-handling middleware (4 parameters: err, req, res, next).
// Catches all errors thrown or passed via next(error) from any route or middleware, logs them, and sends a consistent JSON error response.
// Why: Without a centralized error handler, unhandled errors would crash the server or return inconsistent error formats. 
// This ensures every error is logged and the client always gets a JSON response.

// Section 1: Dependencies
const { logError } = require('../utils/logger');

// Section 2: Error Handler Logic
// - Logs the error message with timestamp via the logger utility
// - Uses the existing res.statusCode if it was set by previous middleware (e.g., notFound sets 404), otherwise defaults to 500
// - Returns a consistent { success: false, error: "..." } response
// Why check res.statusCode !== 200: Express defaults statusCode to 200, so if it's still 200 when an error occurs, 
// it means no middleware set a specific error code, and we should use 500.
const errorHandler = (err, req, res, next) => {
  logError(err.message);

  res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};

module.exports = errorHandler;