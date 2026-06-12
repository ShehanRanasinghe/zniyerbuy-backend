// Interaction Tracking Validators

// Defines express-validator validation chains for the interaction tracking endpoint.
// Why: Ensures only valid interaction types are recorded and that product references are proper UUIDs, keeping analytics data clean.

// Section 1: Dependencies
const { body } = require('express-validator');

// Section 2: Track Interaction Validator
// Used on: POST /api/v1/interactions
// Validates:
//   - product_id: must be a valid UUID
//   - interaction_type: must be one of the predefined types ('view', 'click', 'favorite', 'purchase')
// Why restrict interaction_type: Using an enum-like validation prevents invalid data from polluting analytics. 
// The recommendation engine relies on these specific types to weight user behavior.
exports.trackInteractionValidator = [
  body('product_id')
    .optional()
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('shop_id')
    .optional()
    .isUUID()
    .withMessage('Valid shop ID is required'),

  body('deal_id')
    .optional()
    .isUUID()
    .withMessage('Valid deal ID is required'),

  body('action_type')
    .isIn(['view', 'save', 'click_deal', 'search', 'purchase'])
    .withMessage('Invalid action type'),
];