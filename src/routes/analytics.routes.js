// Analytics & Dashboard Routes

// Defines HTTP routes for analytics endpoints. All routes are protected and most require specific roles (admin or shop_owner).
// Why role-restricted: Analytics data contains sensitive business metrics. 
// Admin endpoints show platform-wide stats, while seller endpoints show only the authenticated seller's data.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Section 2: Controller Imports
const {
  getDashboardStats,
  getSellerStats,
  getTopProducts,
  getTopCategories,
  getUserActivityStats,
  getPopularShops,
  getSellerPerformance,
} = require('../controllers/analytics.controller');

// Section 3: Admin-Only Routes
// These endpoints provide platform-wide analytics and are restricted to admin users only.
// GET /dashboard - Total products, shops, deals, users counts
// GET /top-categories - Product count by category
// GET /user-activity - Total views, searches, favorites platform-wide
// GET /popular-shops - Shops ranked by product engagement
router.get(
  '/dashboard',
  protect,
  authorize('admin'),
  getDashboardStats
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

// Section 4: Seller Routes (shop_owner + admin)
// These endpoints provide seller-specific analytics and are accessible to shop owners viewing their own data and admins.
// GET /seller - Seller's total shops, products, deals, reviews
// GET /seller/top-products - Seller's top 10 products by score
// GET /seller/performance - Seller's aggregate engagement metrics
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
  '/seller/performance',
  protect,
  authorize('shop_owner', 'admin'),
  getSellerPerformance
);

module.exports = router;