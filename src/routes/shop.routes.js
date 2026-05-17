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
  getShopById,
} = require('../controllers/shop.controller');

router.get('/nearby', getNearbyShops);

router.get('/:id', getShopById);

router.post(
  '/',
  protect,
  createShopValidator,
  validate,
  createShop
);

module.exports = router;