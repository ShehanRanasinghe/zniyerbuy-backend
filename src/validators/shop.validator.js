const { body } = require('express-validator');

exports.createShopValidator = [
  body('shop_name')
    .notEmpty()
    .withMessage('Shop name is required'),

  body('address')
    .notEmpty()
    .withMessage('Address is required'),

  body('latitude')
    .isFloat()
    .withMessage('Valid latitude is required'),

  body('longitude')
    .isFloat()
    .withMessage('Valid longitude is required'),

  body('contact_number')
    .notEmpty()
    .withMessage('Contact number is required'),
];