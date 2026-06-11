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