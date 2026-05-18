const { body } = require('express-validator');

exports.trackInteractionValidator = [
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('interaction_type')
    .isIn(['view', 'click', 'favorite', 'purchase'])
    .withMessage('Invalid interaction type'),
];