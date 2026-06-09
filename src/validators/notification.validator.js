// Notification Request Validators

// Defines express-validator validation chains for notification creation.
// Why: Ensures notifications have a valid target user, title, and message before storage, preventing incomplete notification records.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Create Notification Validator
// Used on: POST /api/v1/notifications
// Validates:
//   - user_id: must be a valid UUID (the target user to notify)
//   - title: required (notification headline)
//   - message: required (notification body text)
// Why user_id is validated here: Unlike favorites/interactions where user_id comes from req.user, 
// notifications can target ANY user (sent by admins or system processes), so it must be in the body.
exports.createNotificationValidator = [
  body('user_id')
    .isUUID()
    .withMessage('Valid user ID is required'),

  body('title')
    .notEmpty()
    .withMessage('Title is required'),

  body('message')
    .notEmpty()
    .withMessage('Message is required'),
];