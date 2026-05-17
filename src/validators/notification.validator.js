const { body } = require('express-validator');

exports.createNotificationValidator = [
  body('user_id')
    .isUUID()
    .withMessage('Valid user ID is required'),

  body('title')
    .notEmpty()
    .withMessage('Title is required'),

  body('message')
    .notEmpty()
    .withMessage('Message is required'),
];