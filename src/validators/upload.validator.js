const { body } = require('express-validator');

exports.updateProductImageValidator = [
  body('image_url')
    .isURL()
    .withMessage('Valid image URL is required'),
];