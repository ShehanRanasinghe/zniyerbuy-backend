const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const {
  getDashboardStats,
  getSellerStats,
  getTopProducts,
  getTopCategories,
} = require('../controllers/analytics.controller');

router.get(
  '/dashboard',
  protect,
  authorize('admin'),
  getDashboardStats
);

router.get(
  '/seller',
  protect,
  authorize('shop_owner', 'admin'),
  getSellerStats
);

router.get(
  '/seller/top-products',
  protect,
  authorize('shop_owner', 'admin'),
  getTopProducts
);

router.get(
  '/top-categories',
  protect,
  authorize('admin'),
  getTopCategories
);

module.exports = router;