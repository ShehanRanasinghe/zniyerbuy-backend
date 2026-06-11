// Review Request Validators

// Defines express-validator validation chains for review creation.
// Why: Ensures reviews have valid shop references and rating values within the expected range. 
// Comments are optional but length-limited to prevent abuse.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Create Review Validator
// Used on: POST /api/v1/reviews
// Validates:
//   - shop_id: must be a valid UUID (which shop is being reviewed)
//   - rating: must be between 1 and 5 (standard 5-star scale)
//   - comment: optional, max 500 characters
// Why rating 1-5 (not 0-5): A rating of 0 is ambiguous (is it "terrible" or "not rated"?). 
// Starting at 1 aligns with the standard star-rating UX pattern.
// Why comment max 500: Prevents excessively long reviews while giving enough space for meaningful feedback.
exports.createReviewValidator = [
  body('shop_id')
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment too long'),
];