// Favorite Request Validators

// Defines express-validator validation chains for the add-favorite endpoint.
// Why: Ensures the referenced entity id is a valid UUID before attempting
// to insert a favorite record, preventing invalid foreign key errors.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Add Favorite Validator
// Used on: POST /api/v1/favorites
// Validates:
//   - type: optional, one of 'product' | 'shop' | 'deal' (defaults to
//     'product' for backward compatibility with existing callers that only
//     ever sent product_id).
//   - Whichever id field matches the type must be a valid UUID:
//     product_id for 'product', shop_id for 'shop', discount_id for 'deal'.
// Why only the id fields are validated here: user_id comes from req.user
// (set by auth middleware), so it doesn't need client-side validation.
exports.addFavoriteValidator = [
  body('type')
    .optional()
    .isIn(['product', 'shop', 'deal'])
    .withMessage('Type must be product, shop, or deal'),

  body('product_id')
    .if((value, { req }) => (req.body.type || 'product') === 'product')
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('shop_id')
    .if((value, { req }) => req.body.type === 'shop')
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('discount_id')
    .if((value, { req }) => req.body.type === 'deal')
    .isUUID()
    .withMessage('Valid deal ID is required'),
];