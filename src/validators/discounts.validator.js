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
exports.createDiscountValidator = [
  body('shop_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Valid shop ID is required when provided'),

  body('product_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('title')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('Deal title is required'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string'),

  body('occasion_type')
    .optional({ nullable: true })
    .isString()
    .withMessage('Occasion type must be a string'),

  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed', 'fixed_amount'])
    .withMessage('Discount type must be percentage, fixed, or fixed_amount'),

  body('discount_value')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Valid discount value is required'),

  body('discount_percentage')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),

  body('original_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Valid original price is required'),

  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),

  body('deal_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Valid deal price is required'),

  body('discounted_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Valid discounted price is required'),

  body('start_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Valid start date required'),

  body('end_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Valid end date required'),
];

exports.createDealValidator = exports.createDiscountValidator;