// Product Request Validators

// Defines express-validator validation chains for product creation.
// Why: Ensures products have valid shop references, names, prices, and stock quantities before database insertion. 
// Invalid data here could break the marketplace listing and checkout flows.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Create Product Validator
// Used on: POST /api/v1/products
// Validates:
//   - shop_id: must be a valid UUID (which shop sells this product)
//   - product_name: required (displayed in listings and search results)
//   - price: must be a positive number (0 allowed for free items)
//   - stock_quantity: must be a non-negative integer
// Why min: 0 for price and stock: Allows zero (free items or out-of-stock) but prevents negative values which are meaningless.
exports.createProductValidator = [
  body('shop_id')
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('name')
    .notEmpty()
    .withMessage('Product name is required'),

  body('original_price')
    .isFloat({ min: 0 })
    .withMessage('Valid original price is required'),

  body('current_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valid current price is required'),

  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Valid stock quantity is required'),

  body('unit')
    .optional()
    .isIn(['kg', 'piece', 'litre', 'pack', 'dozen', 'metre'])
    .withMessage('Invalid unit type'),
];