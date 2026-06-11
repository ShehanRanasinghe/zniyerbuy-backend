// Admin Routes

// Defines HTTP routes for admin-panel operations: user management, shop verification, product moderation, and dashboard analytics.
// All routes require authentication (protect) and admin authorization (authorize).
// Why separate route file: Keeps admin operations isolated for security and easier maintenance.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Section 2: Controller Imports
const {
  getAllUsers,
  getRecentUsers,
  updateUserRole,
  deleteUser,
  getAllShops,
  updateShopStatus,
  deleteShop,
  getAllProducts,
  flagProduct,
  deleteProduct,
  getDashboardStats,
} = require('../controllers/admin.controller');

// Section 3: Admin User Management Routes
// All user management routes require admin authentication
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/recent', protect, authorize('admin'), getRecentUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Section 4: Admin Shop Management Routes
// All shop management routes require admin authentication
router.get('/shops', protect, authorize('admin'), getAllShops);
router.patch('/shops/:id/verify', protect, authorize('admin'), updateShopStatus);
router.delete('/shops/:id', protect, authorize('admin'), deleteShop);

// Section 5: Admin Product Management Routes
// All product management routes require admin authentication
router.get('/products', protect, authorize('admin'), getAllProducts);
router.patch('/products/:id/flag', protect, authorize('admin'), flagProduct);
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

// Section 6: Admin Dashboard Analytics Routes
// Statistics route for analytics dashboard
router.get('/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
