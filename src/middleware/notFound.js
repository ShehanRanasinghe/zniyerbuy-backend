// Not Found Middleware

// Catches any request that does not match a registered route.
// Creates a descriptive error and sets a 404 status, then passes the error to the global errorHandler middleware via next().
// Why: Without this, unmatched routes would hang or return the default Express response. 
// This provides a consistent JSON 404 response that includes the attempted URL for easier debugging.

// Section 1: Not Found Handler
// - Creates an Error with the original URL the client tried to reach
// - Sets res.status(404) so the errorHandler knows it's a 404
// - Calls next(error) to delegate to the errorHandler middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = notFound;