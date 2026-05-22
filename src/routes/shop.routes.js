const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const authorize = require('../middleware/authorize');

const checkShopOwnership = require('../middleware/checkShopOwnership');

const {
  createShopValidator,
} = require('../validators/shop.validator');

const {
  updateProductImageValidator,
} = require('../validators/upload.validator');

const {
  createShop,
  getNearbyShops,
  getShopById,
  updateShopImage,
} = require('../controllers/shop.controller');

router.get('/nearby', getNearbyShops);

router.patch(
  '/:id/image',
  protect,
  authorize('shop_owner', 'admin'),
  checkShopOwnership,
  updateProductImageValidator,
  validate,
  updateShopImage
);

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