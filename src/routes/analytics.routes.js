const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const {
  getDashboardStats,
} = require('../controllers/analytics.controller');

router.get(
  '/dashboard',
  protect,
  authorize('admin'),
  getDashboardStats
);

module.exports = router;