const { body } = require('express-validator');

exports.createProductValidator = [
  body('shop_id')
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('product_name')
    .notEmpty()
    .withMessage('Product name is required'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),

  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Valid stock quantity is required'),
];