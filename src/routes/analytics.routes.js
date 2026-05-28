const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const {
  getDashboardStats,
  getSellerStats,
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

module.exports = router;