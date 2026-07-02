// Admin Routes
// Defines HTTP routes for admin-panel operations: user management, shop verification,
// product moderation, deal management, reviews, notifications, and dashboard analytics.
// All routes require authentication (protect) and admin authorization (authorize).

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const {
  getAllUsers,
  getRecentUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllShops,
  updateShopStatus,
  deleteShop,
  getAllProducts,
  flagProduct,
  deleteProduct,
  getDashboardStats,
  getTrendData,
  getAllDeals,
  toggleDeal,
  deleteDeal,
  getAllReviews,
  deleteReview,
  getAllNotifications,
  deleteNotification,
} = require('../controllers/admin.controller');

// Admin User Management Routes
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/users', protect, authorize('admin'), getAllUsers);

/**
 * @swagger
 * /admin/users/recent:
 *   get:
 *     summary: Get recently registered users
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/users/recent', protect, authorize('admin'), getRecentUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, shop_owner, admin]
 *     responses:
 *       200:
 *         description: User role updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status toggled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/users/:id/status', protect, authorize('admin'), toggleUserStatus);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Admin Shop Management Routes
/**
 * @swagger
 * /admin/shops:
 *   get:
 *     summary: Get all shops
 *     tags: [Admin - Shop Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shops
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/shops', protect, authorize('admin'), getAllShops);

/**
 * @swagger
 * /admin/shops/{id}/verify:
 *   patch:
 *     summary: Update shop verification status
 *     tags: [Admin - Shop Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Shop verification status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/shops/:id/verify', protect, authorize('admin'), updateShopStatus);

/**
 * @swagger
 * /admin/shops/{id}:
 *   delete:
 *     summary: Delete a shop
 *     tags: [Admin - Shop Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Shop deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/shops/:id', protect, authorize('admin'), deleteShop);

// Admin Product Management Routes
/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin - Product Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/products', protect, authorize('admin'), getAllProducts);

/**
 * @swagger
 * /admin/products/{id}/flag:
 *   patch:
 *     summary: Flag a product for review
 *     tags: [Admin - Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_flagged:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product flagged status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/products/:id/flag', protect, authorize('admin'), flagProduct);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin - Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

// Admin Deal Management Routes
/**
 * @swagger
 * /admin/deals:
 *   get:
 *     summary: Get all deals
 *     tags: [Admin - Deal Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all deals
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/deals', protect, authorize('admin'), getAllDeals);

/**
 * @swagger
 * /admin/deals/{id}/toggle:
 *   patch:
 *     summary: Toggle deal active status
 *     tags: [Admin - Deal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal status toggled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/deals/:id/toggle', protect, authorize('admin'), toggleDeal);

/**
 * @swagger
 * /admin/deals/{id}:
 *   delete:
 *     summary: Delete a deal
 *     tags: [Admin - Deal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/deals/:id', protect, authorize('admin'), deleteDeal);

// Admin Review Management Routes
/**
 * @swagger
 * /admin/reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Admin - Review Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/reviews', protect, authorize('admin'), getAllReviews);

/**
 * @swagger
 * /admin/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Admin - Review Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/reviews/:id', protect, authorize('admin'), deleteReview);

// Admin Notification Management Routes
/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Admin - Notification Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all notifications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/notifications', protect, authorize('admin'), getAllNotifications);

/**
 * @swagger
 * /admin/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Admin - Notification Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/notifications/:id', protect, authorize('admin'), deleteNotification);

// Admin Dashboard Analytics Routes
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin - Analytics]
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
router.get('/stats', protect, authorize('admin'), getDashboardStats);

/**
 * @swagger
 * /admin/trends:
 *   get:
 *     summary: Get trend data
 *     tags: [Admin - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/trends', protect, authorize('admin'), getTrendData);

module.exports = router;
