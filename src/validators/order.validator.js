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

// Create Order (Place Order) Validator
// Used on: POST /api/v1/orders
// Validates the minimum a customer must supply to place an order: at
// least one product line item, and — since delivery is the default —
// a delivery address whenever delivery_type isn't 'pickup'.
// Why items is a nested array: A single order can contain multiple
// products from the same shop (e.g. added from a shop page), even though
// the product-details "Place Order" button only ever sends one.
exports.createOrderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.product_id')
    .isUUID()
    .withMessage('Each item must have a valid product ID'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be a positive integer'),

  body('delivery_type')
    .optional()
    .isIn(['delivery', 'pickup'])
    .withMessage('Delivery type must be delivery or pickup'),

  body('payment_method')
    .optional()
    .isIn(['cod'])
    .withMessage('Only cash on delivery (cod) is supported right now'),

  body('delivery_address')
    .if(body('delivery_type').not().equals('pickup'))
    .notEmpty()
    .withMessage('Delivery address is required unless picking up in-store'),
];