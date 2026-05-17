const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createNotificationValidator,
} = require('../validators/notification.validator');

const {
  createNotification,
  getUserNotifications,
} = require('../controllers/notification.controller');

router.get('/', protect, getUserNotifications);

router.post(
  '/',
  protect,
  createNotificationValidator,
  validate,
  createNotification
);

module.exports = router;