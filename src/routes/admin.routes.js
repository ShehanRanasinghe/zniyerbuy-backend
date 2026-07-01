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
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/recent', protect, authorize('admin'), getRecentUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.patch('/users/:id/status', protect, authorize('admin'), toggleUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Admin Shop Management Routes
router.get('/shops', protect, authorize('admin'), getAllShops);
router.patch('/shops/:id/verify', protect, authorize('admin'), updateShopStatus);
router.delete('/shops/:id', protect, authorize('admin'), deleteShop);

// Admin Product Management Routes
router.get('/products', protect, authorize('admin'), getAllProducts);
router.patch('/products/:id/flag', protect, authorize('admin'), flagProduct);
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

// Admin Deal Management Routes
router.get('/deals', protect, authorize('admin'), getAllDeals);
router.patch('/deals/:id/toggle', protect, authorize('admin'), toggleDeal);
router.delete('/deals/:id', protect, authorize('admin'), deleteDeal);

// Admin Review Management Routes
router.get('/reviews', protect, authorize('admin'), getAllReviews);
router.delete('/reviews/:id', protect, authorize('admin'), deleteReview);

// Admin Notification Management Routes
router.get('/notifications', protect, authorize('admin'), getAllNotifications);
router.delete('/notifications/:id', protect, authorize('admin'), deleteNotification);

// Admin Dashboard Analytics Routes
router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/trends', protect, authorize('admin'), getTrendData);

module.exports = router;
