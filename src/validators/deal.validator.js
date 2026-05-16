const { body } = require('express-validator');

exports.createDealValidator = [
  body('shop_id')
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('title')
    .notEmpty()
    .withMessage('Deal title is required'),

  body('discount_percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),

  body('start_date')
    .isISO8601()
    .withMessage('Valid start date required'),

  body('end_date')
    .isISO8601()
    .withMessage('Valid end date required'),
];