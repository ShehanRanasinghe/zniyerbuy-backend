// API Rate Limiting Middleware

// Configures a rate limiter to prevent API abuse by limiting the number of requests a single IP can make within a time window.
// Why: Protects against brute-force attacks, DDoS, and excessive API usage that could degrade performance for other users.

// Section 1: Dependencies
const rateLimit = require('express-rate-limit');

// Section 2: Rate Limiter Configuration
// - windowMs: 15 minutes (900,000ms) - the time window for counting requests
// - max: 200 - maximum requests allowed per IP within the window
// - standardHeaders: true - sends rate limit info in RateLimit-* headers (helps clients implement their own retry logic)
// - legacyHeaders: false - disables deprecated X-RateLimit-* headers
// - message: custom JSON response when the limit is exceeded
// Why 200 requests per 15 minutes: Balances between allowing normal usage patterns and blocking abusive behavior.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

module.exports = apiLimiter;