const { body } = require('express-validator');

exports.addFavoriteValidator = [
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
];