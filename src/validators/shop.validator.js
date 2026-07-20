// Shop Request Validators

// Defines express-validator validation chains for shop creation.
// Why: Ensures shops have names, addresses, valid geo-coordinates, and contact information before database insertion. 
// Geolocation data is especially important for the nearby shops feature.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Create Shop Validator
// Used on: POST /api/v1/shops
// Validates:
//   - shop_name: required (displayed in listings and search results)
//   - address: required (physical address for the shop)
//   - latitude: must be a valid float (for geolocation/nearby shops)
//   - longitude: must be a valid float (for geolocation/nearby shops)
//   - contact_number: required (how customers reach the shop)
// Why latitude/longitude are required: The getNearbyShops feature depends on valid coordinates. 
// Shops without coordinates would never appear in location-based search results.
exports.createShopValidator = [
  body('name')
    .notEmpty()
    .withMessage('Shop name is required'),

  body('category')
    .optional()
    .isIn(['grocery', 'electronics', 'clothing', 'food', 'pharmacy', 'beauty', 'sports', 'other'])
    .withMessage('Invalid shop category'),

  body('address')
    .notEmpty()
    .withMessage('Address is required'),

  body('city')
    .notEmpty()
    .withMessage('City is required'),

  body('latitude')
    .isFloat()
    .withMessage('Valid latitude is required'),

  body('longitude')
    .isFloat()
    .withMessage('Valid longitude is required'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
];

// Section 3: Update Shop Validator
// Used on: PATCH /api/v1/shops/:id
// All fields optional since this is a partial update — only validates
// fields that are actually present in the request body.
exports.updateShopValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Shop name cannot be empty'),

  body('category')
    .optional()
    .isIn(['grocery', 'electronics', 'clothing', 'food', 'pharmacy', 'beauty', 'sports', 'other'])
    .withMessage('Invalid shop category'),

  body('address')
    .optional()
    .notEmpty()
    .withMessage('Address cannot be empty'),

  body('city')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty'),

  body('latitude')
    .optional()
    .isFloat()
    .withMessage('Valid latitude is required'),

  body('longitude')
    .optional()
    .isFloat()
    .withMessage('Valid longitude is required'),

  body('phone')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty'),

  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('Valid email is required'),

  body('opening_hours')
    .optional({ nullable: true })
    .isString()
    .withMessage('Opening hours must be a string'),

  body('logo_url')
    .optional({ nullable: true })
    .isString()
    .withMessage('Logo URL must be a string'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be active, inactive, or suspended'),
];