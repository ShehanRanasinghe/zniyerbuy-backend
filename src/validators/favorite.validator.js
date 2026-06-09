// Favorite Request Validators

// Defines express-validator validation chains for the add-favorite endpoint.
// Why: Ensures the product_id is a valid UUID before attempting to insert a favorite record, preventing invalid foreign key errors.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Add Favorite Validator
// Used on: POST /api/v1/favorites
// Validates:
//   - product_id: must be a valid UUID (references the product to favorite)
// Why only product_id: The user_id comes from req.user (set by auth middleware), so it doesn't need client-side validation.
exports.addFavoriteValidator = [
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
];