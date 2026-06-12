// Deal Request Validators

// Defines express-validator validation chains for deal creation endpoints.
// Why: Ensures deals have valid shop references, titles, discount ranges, and properly formatted date ranges before insertion.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Create Deal Validator
// Used on: POST /api/v1/deals
// Validates:
//   - shop_id: must be a valid UUID (references the shop offering the deal)
//   - title: required (deal headline displayed to users)
//   - discount_percentage: must be between 0 and 100 (0% = no discount, 100% = free)
//   - start_date: must be ISO 8601 format (e.g., "2025-06-01T00:00:00Z")
//   - end_date: must be ISO 8601 format
// Why isUUID for shop_id: Supabase uses UUID primary keys. 
// Validating the format prevents invalid foreign key errors at the database level.
exports.createDealValidator = [
  body('shop_id')
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('product_id')
    .optional()
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('title')
    .notEmpty()
    .withMessage('Deal title is required'),

  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed_amount'])
    .withMessage('Discount type must be percentage or fixed_amount'),

  body('discount_value')
    .isFloat({ min: 0 })
    .withMessage('Valid discount value is required'),

  body('original_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valid original price is required'),

  body('deal_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valid deal price is required'),

  body('start_date')
    .isISO8601()
    .withMessage('Valid start date required'),

  body('end_date')
    .isISO8601()
    .withMessage('Valid end date required'),
];