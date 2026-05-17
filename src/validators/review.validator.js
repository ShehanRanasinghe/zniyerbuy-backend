const { body } = require('express-validator');

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