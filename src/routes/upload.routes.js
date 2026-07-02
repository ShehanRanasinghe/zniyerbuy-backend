// File Upload Routes
// Defines HTTP routes for uploading product and shop images.
// Both endpoints require authentication and use multer middleware to handle multipart/form-data file uploads.
// Why: Separates the file upload concern from image URL updates.
// These routes handle the actual binary file upload to Supabase Storage, while the PATCH /:id/image routes on products/shops update the database record with a URL after upload.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Section 2: Controller Imports
const {
  uploadProductImage,
  uploadShopImage,
} = require('../controllers/upload.controller');

// Section 3: Route Definitions
// POST /product-image - Upload a product image (authenticated)
//   Middleware chain: protect -> upload.single('image') -> uploadProductImage
//   Why upload.single('image'): Accepts a single file from the 'image' form field, stores it in memory, then the controller uploads it to Supabase Storage.
// POST /shop-image - Upload a shop image (authenticated)
//   Middleware chain: protect -> upload.single('image') -> uploadShopImage
//   Same flow but targets the 'shop-images' storage bucket.
/**
 * @swagger
 * /uploads/product-image:
 *   post:
 *     summary: Upload a product image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/product-image',
  protect,
  upload.single('image'),
  uploadProductImage
);

/**
 * @swagger
 * /uploads/shop-image:
 *   post:
 *     summary: Upload a shop image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/shop-image',
  protect,
  upload.single('image'),
  uploadShopImage
);

module.exports = router;