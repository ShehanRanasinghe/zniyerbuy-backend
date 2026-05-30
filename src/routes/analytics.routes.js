const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const {
  getDashboardStats,
  getSellerStats,
  getTopProducts,
  getTopCategories,
  getUserActivityStats,
  getPopularShops,
  getSellerPerformance,
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

router.get(
  '/user-activity',
  protect,
  authorize('admin'),
  getUserActivityStats
);

router.get(
  '/popular-shops',
  protect,
  authorize('admin'),
  getPopularShops
);

router.get(
  '/seller/performance',
  protect,
  authorize('shop_owner', 'admin'),
  getSellerPerformance
);

module.exports = router;