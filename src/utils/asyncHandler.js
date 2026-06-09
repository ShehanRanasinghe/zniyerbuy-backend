// Async Error Handling Utility

// A higher-order function that wraps async route handlers to automatically catch rejected promises and forward them to Express's error handling middleware via next().
// Why: Without this wrapper, every async controller would need its own try/catch block to prevent unhandled promise rejections from crashing the server. 
// This utility centralizes that concern.
// Usage: exports.myHandler = asyncHandler(async (req, res) => { ... });
// Note: Many controllers in this project use asyncHandler AND also have internal try/catch blocks. 
// The internal try/catch provides custom error responses (status 500 with JSON), while asyncHandler acts as a safety net for any uncaught errors that slip through.

// Section 1: Async Handler Wrapper
// Takes an async function (fn) and returns a new function that:
//   1. Calls fn(req, res, next)
//   2. Wraps the result in Promise.resolve() to handle both sync and async functions
//   3. Catches any rejections and forwards them to next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;