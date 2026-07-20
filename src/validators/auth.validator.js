// Authentication Request Validators

// Defines express-validator validation chains for authentication endpoints.
// These validators are middleware arrays that run BEFORE the validate middleware and the controller, ensuring request data meets requirements.
// Why: Catches invalid input early (before hitting the database), providing clear error messages to the client and preventing bad data from being stored.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Register Validator
// Used on: POST /api/v1/auth/register
// Validates:
//   - firebase_uid: required (links to Firebase auth account)
//   - email: must be a valid email format
//   - full_name: required (user's display name)
//   - role: optional, must be one of the allowed roles if provided
// Why role is optional: Defaults to 'consumer' in the controller if not specified. 
// Only specific roles are allowed to prevent users from self-assigning admin privileges.
exports.registerValidator = [
  body('firebase_uid')
    .notEmpty()
    .withMessage('Firebase UID is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('full_name')
    .notEmpty()
    .withMessage('Full name is required'),

  body('role')
    .optional()
    .isIn(['consumer', 'shop_owner', 'admin'])
    .withMessage('Invalid role'),
];

// Section 3: Update Profile Validator
// Used on: PATCH /api/v1/auth/me
// Validates the fields a user can update about their own profile.
// All optional since this is a partial update.
exports.updateProfileValidator = [
  body('full_name')
    .optional()
    .notEmpty()
    .withMessage('Full name cannot be empty'),

  body('phone')
    .optional({ nullable: true })
    .isString()
    .withMessage('Phone must be a string'),

  body('avatar_url')
    .optional({ nullable: true })
    .isString()
    .withMessage('Avatar URL must be a string'),
];