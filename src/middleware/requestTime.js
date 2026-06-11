// Request Timestamp Middleware

// Attaches an ISO 8601 timestamp to each incoming request object.
// Downstream handlers can access req.requestTime for logging, response metadata, or performance tracking.
// Why: Provides a consistent, server-generated timestamp for when the request was received. 
// Used by the health check controller and can be used for audit logging and request tracing.

// Section 1: Timestamp Middleware
// Records the current time in ISO format (e.g., "2025-05-31T12:00:00.000Z") and attaches it to the request object before passing control forward.
const requestTime = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};

module.exports = requestTime;