const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createShopValidator,
} = require('../validators/shop.validator');

const {
  createShop,
  getNearbyShops,
} = require('../controllers/shop.controller');

router.get('/nearby', getNearbyShops);

router.post(
  '/',
  protect,
  createShopValidator,
  validate,
  createShop
);

module.exports = router;