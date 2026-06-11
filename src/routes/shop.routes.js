// Shop Routes

// Defines HTTP routes for shop operations: listing nearby shops, getting shop details, creating shops, and updating shop images.
// Why: Shops are core business entities in the marketplace.
// Some operations are public (viewing shops) while others are restricted to shop owners and admins (creating, updating).

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const authorize = require('../middleware/authorize');

const checkShopOwnership = require('../middleware/checkShopOwnership');

// Section 2: Validator Imports
const {
  createShopValidator,
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
} = require('../controllers/shop.controller');

// Section 4: Public Routes
// GET /nearby - Find shops near a location (public)
//   Requires latitude/longitude query params. No auth needed so anyone can discover nearby shops.
router.get('/nearby', getNearbyShops);

// Section 5: Protected Shop Image Update
// PATCH /:id/image - Update a shop's image
//   Middleware chain: protect -> authorize -> checkShopOwnership -> updateProductImageValidator -> validate -> updateShopImage
//   Why this chain: Only authenticated shop_owners/admins who actually own the shop can update its image. 
//   The updateProductImageValidator is reused here (validates image_url).
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
router.get('/:id', getShopById);

router.post(
  '/',
  protect,
  authorize('shop_owner', 'admin'),
  createShopValidator,
  validate,
  createShop
);

module.exports = router;