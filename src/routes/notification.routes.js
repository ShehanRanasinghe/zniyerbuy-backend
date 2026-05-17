const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createNotificationValidator,
} = require('../validators/notification.validator');

const {
  createNotification,
} = require('../controllers/notification.controller');

router.post(
  '/',
  protect,
  createNotificationValidator,
  validate,
  createNotification
);

module.exports = router;