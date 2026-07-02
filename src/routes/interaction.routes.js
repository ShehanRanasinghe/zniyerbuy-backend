// User Interaction Tracking Routes

// Defines the route for recording user-product interactions.
// All interaction tracking requires authentication.
// Why auth required: Interactions are tied to a specific user. Anonymous tracking would require a different approach (e.g., sessions).

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Section 2: Controller & Validator Imports
const {
  trackInteractionValidator,
} = require('../validators/interaction.validator');

const {
  trackInteraction,
} = require('../controllers/interaction.controller');

// Section 3: Route Definition
// POST / - Record a user-product interaction (authenticated)
//   Middleware chain: protect -> trackInteractionValidator -> validate -> trackInteraction
//   Why this chain: Ensures the user is authenticated, the input is valid (UUID product_id, valid interaction_type), then records the interaction.
/**
 * @swagger
 * /interactions:
 *   post:
 *     summary: Track user-product interaction
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - interaction_type
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               interaction_type:
 *                 type: string
 *                 enum: [view, click, search, favorite, purchase]
 *     responses:
 *       201:
 *         description: Interaction tracked successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  protect,
  trackInteractionValidator,
  validate,
  trackInteraction
);

module.exports = router;