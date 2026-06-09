// Upload/Image URL Validators

// Defines express-validator validation chains for image URL update endpoints.
// Used when updating product or shop images via PATCH endpoints (not for the file upload endpoints which use multer).
// Why: The PATCH /:id/image endpoints accept an image_url string (not a file). 
// This validator ensures the URL is properly formatted before updating the DB.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Update Product Image Validator
// Used on: PATCH /api/v1/products/:id/image and PATCH /api/v1/shops/:id/image
// Validates:
//   - image_url: must be a valid URL format
// Why isURL(): Prevents storing malformed strings as image URLs which would cause broken images in the frontend.
// Note: Despite the name "updateProductImageValidator", this validator is also used for shop image updates (in shop.routes.js).
exports.updateProductImageValidator = [
  body('image_url')
    .isURL()
    .withMessage('Valid image URL is required'),
];