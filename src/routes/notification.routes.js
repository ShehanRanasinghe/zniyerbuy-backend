// Notification Routes

// Defines HTTP routes for notification operations: retrieving user notifications and creating new ones.
// Both endpoints require authentication.
// Why: Notifications are user-specific. Reading notifications requires knowing which user is requesting, and creating notifications should be restricted to authenticated users.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Section 2: Controller & Validator Imports
const {
  createNotificationValidator,
} = require('../validators/notification.validator');

const {
  createNotification,
  getUserNotifications,
} = require('../controllers/notification.controller');

// Section 3: Route Definitions
// GET / - Get the authenticated user's notifications
//   Middleware chain: protect -> getUserNotifications
// POST / - Create a notification for a user
//   Middleware chain: protect -> createNotificationValidator -> validate -> createNotification
//   Why validate: Ensures user_id, title, and message are provided.
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - title
 *               - message
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *     responses:
 *       201:
 *         description: Notification created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getUserNotifications);

router.post(
  '/',
  protect,
  createNotificationValidator,
  validate,
  createNotification
);

module.exports = router;