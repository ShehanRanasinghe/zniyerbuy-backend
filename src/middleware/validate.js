// Request Validation Middleware

// Checks the results of express-validator validation chains and returns 400 Bad Request with error details if validation fails.
// Must be placed in the middleware chain AFTER the validator arrays (e.g., registerValidator, createProductValidator).
// Why: Centralizes validation result checking so each route doesn't need to repeat the same validation-result handling code. 
// The validators define the rules; this middleware enforces them.

// Section 1: Dependencies
const { validationResult } = require('express-validator');

// Section 2: Validation Result Handler
// - Calls validationResult(req) to collect any validation errors
// - If errors exist, returns 400 with the array of error objects
// - If no errors, calls next() to proceed to the controller
// Why return errors.array(): Provides detailed error info including which field failed, what value was provided, and the error message.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = validate;