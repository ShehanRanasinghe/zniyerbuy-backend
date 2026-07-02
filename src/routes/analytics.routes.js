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
/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get platform-wide dashboard statistics
 *     tags: [Analytics - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/dashboard',
  protect,
  authorize('admin'),
  getDashboardStats
);

/**
 * @swagger
 * /analytics/top-categories:
 *   get:
 *     summary: Get top product categories
 *     tags: [Analytics - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top categories by product count
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/top-categories',
  protect,
  authorize('admin'),
  getTopCategories
);

/**
 * @swagger
 * /analytics/user-activity:
 *   get:
 *     summary: Get user activity statistics
 *     tags: [Analytics - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/user-activity',
  protect,
  authorize('admin'),
  getUserActivityStats
);

/**
 * @swagger
 * /analytics/popular-shops:
 *   get:
 *     summary: Get most popular shops
 *     tags: [Analytics - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popular shops by engagement
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
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
/**
 * @swagger
 * /analytics/seller:
 *   get:
 *     summary: Get seller statistics
 *     tags: [Analytics - Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller's shop and product statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner or admin only
 */
router.get(
  '/seller',
  protect,
  authorize('shop_owner', 'admin'),
  getSellerStats
);

/**
 * @swagger
 * /analytics/seller/top-products:
 *   get:
 *     summary: Get seller's top products
 *     tags: [Analytics - Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top 10 products by engagement score
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner or admin only
 */
router.get(
  '/seller/top-products',
  protect,
  authorize('shop_owner', 'admin'),
  getTopProducts
);

/**
 * @swagger
 * /analytics/seller/performance:
 *   get:
 *     summary: Get seller performance metrics
 *     tags: [Analytics - Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregate engagement metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner or admin only
 */
router.get(
  '/seller/performance',
  protect,
  authorize('shop_owner', 'admin'),
  getSellerPerformance
);

module.exports = router;