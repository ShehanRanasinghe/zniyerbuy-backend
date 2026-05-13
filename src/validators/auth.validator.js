const { body } = require('express-validator');

exports.registerValidator = [
  body('firebase_uid')
    .notEmpty()
    .withMessage('Firebase UID is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('full_name')
    .notEmpty()
    .withMessage('Full name is required'),

  body('role')
    .optional()
    .isIn(['consumer', 'shop_owner', 'admin'])
    .withMessage('Invalid role'),
];