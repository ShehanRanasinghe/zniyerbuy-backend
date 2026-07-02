// Review Routes

// Defines HTTP routes for shop review operations: retrieving reviews for a shop (public) and creating new reviews (authenticated).
// Why: Reviews help consumers make informed decisions about shops.
// Viewing reviews is public (anyone can read them), but creating reviews requires authentication (need to know who wrote it).

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Section 2: Controller & Validator Imports
const {
  createReviewValidator,
} = require('../validators/review.validator');

const {
  createReview,
  getShopReviews,
} = require('../controllers/review.controller');

// Section 3: Route Definitions
// GET /shop/:shopId - Get all reviews for a specific shop (public)
//   Why public: Anyone browsing a shop page should see its reviews.
// POST / - Create a new review (authenticated)
//   Middleware chain: protect -> createReviewValidator -> validate -> createReview
//   Why protect: Reviews need an authenticated user_id to record who wrote them.
/**
 * @swagger
 * /reviews/shop/{shopId}:
 *   get:
 *     summary: Get all reviews for a shop
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: List of shop reviews
 *       404:
 *         description: Shop not found
 */
router.get('/shop/:shopId', getShopReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop_id
 *               - rating
 *               - comment
 *             properties:
 *               shop_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  protect,
  createReviewValidator,
  validate,
  createReview
);

module.exports = router;