// Order Update Validators
//
// Defines express-validator validation chains for updating an order.
// Why: Ensures status/payment_method stay within the allowed set and
// delivery_fee is a sane non-negative number before hitting the database.

const { body } = require('express-validator');

exports.updateOrderValidator = [
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be pending, processing, shipped, delivered, or cancelled'),

  body('payment_method')
    .optional()
    .isIn(['cod', 'paid', 'pickup'])
    .withMessage('Payment method must be cod, paid, or pickup'),

  body('delivery_fee')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a non-negative number'),

  body('invoice_sent')
    .optional()
    .isBoolean()
    .withMessage('invoice_sent must be a boolean'),
];