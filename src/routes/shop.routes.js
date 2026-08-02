// Shop Routes

// Defines HTTP routes for shop operations: listing nearby shops, getting shop details, creating shops, and updating shop images.
// Why: Shops are core business entities in the marketplace.
// Some operations are public (viewing shops) while others are restricted to shop owners and admins (creating, updating).

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const authorize = require('../middleware/authorize');

const checkShopOwnership = require('../middleware/checkShopOwnership');

// Section 2: Validator Imports
const {
  createShopValidator,
  updateShopValidator,
} = require('../validators/shop.validator');

const {
  updateProductImageValidator,
} = require('../validators/upload.validator');

// Section 3: Controller Imports
const {
  createShop,
  getNearbyShops,
  getShopById,
  updateShopImage,
  updateShop,
} = require('../controllers/shop.controller');

// Section 4: Public Routes
// GET /nearby - Find shops near a location (public)
//   Requires latitude/longitude query params. No auth needed so anyone can discover nearby shops.
/**
 * @swagger
 * /shops/nearby:
 *   get:
 *     summary: Get nearby shops based on location
 *     tags: [Shops]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby shops
 *       400:
 *         description: Invalid coordinates
 */
router.get('/nearby', getNearbyShops);

// Section 5: Protected Shop Image Update
// PATCH /:id/image - Update a shop's image
//   Middleware chain: protect -> authorize -> checkShopOwnership -> updateProductImageValidator -> validate -> updateShopImage
//   Why this chain: Only authenticated shop_owners/admins who actually own the shop can update its image. 
//   The updateProductImageValidator is reused here (validates image_url).
/**
 * @swagger
 * /shops/{id}/image:
 *   patch:
 *     summary: Update shop image
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image_url
 *             properties:
 *               image_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Shop image updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not shop owner
 */
router.patch(
  '/:id/image',
  protect,
  authorize('shop_owner', 'admin'),
  checkShopOwnership,
  updateProductImageValidator,
  validate,
  updateShopImage
);

// Section 6: Shop Detail & Creation
// GET /:id - Get a single shop with products and deals (public)
//   Anyone can view shop details.
// POST / - Create a new shop (restricted to shop_owner/admin)
//   Middleware chain: protect -> authorize -> createShopValidator -> validate -> createShop
//   Why authorize: Only users with shop_owner or admin roles should be able to create shops in the marketplace.
/**
 * @swagger
 * /shops/{id}:
 *   get:
 *     summary: Get shop details with products and deals
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Shop details
 *       404:
 *         description: Shop not found
 */
router.get('/:id', optionalAuth, getShopById);

/**
 * @swagger
 * /shops/{id}:
 *   patch:
 *     summary: Update general shop fields (name, phone, opening_hours, logo_url, status, etc)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not shop owner
 *       404:
 *         description: Shop not found
 */
router.patch(
  '/:id',
  protect,
  authorize('shop_owner', 'admin'),
  checkShopOwnership,
  updateShopValidator,
  validate,
  updateShop
);

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Create a new shop
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - latitude
 *               - longitude
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               image_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Shop created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner role required
 */
router.post(
  '/',
  protect,
  authorize('shop_owner', 'admin'),
  createShopValidator,
  validate,
  createShop
);

module.exports = router;