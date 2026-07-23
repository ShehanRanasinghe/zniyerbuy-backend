// AI Routes

// Defines HTTP routes for AI-powered features that connect to the zniyerbuy-ai-module.
// All routes are protected and most require admin authorization for insights.
// Why separate route file: Keeps AI/ML operations isolated and makes it easy to add new AI features.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Section 2: Controller Imports
const {
  generateInsights,
  getProductRecommendations,
  getTrendingProducts,
  predictDemand,
  getShopPredictions,
  checkAIHealth,
} = require('../controllers/ai.controller');

// Section 3: Admin AI Routes
// POST /insights - Generate AI insights for admin dashboard (admin only)
/**
 * @swagger
 * /ai/insights:
 *   post:
 *     summary: Generate AI insights for admin dashboard
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI-generated insights
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/insights',
  protect,
  authorize('admin'),
  generateInsights
);

// Section 4: Recommendation Routes
// GET /recommendations/products - Get personalized product recommendations
/**
 * @swagger
 * /ai/recommendations/products:
 *   get:
 *     summary: Get personalized product recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI-powered product recommendations
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/recommendations/products',
  protect,
  getProductRecommendations
);

// Section 5: Trending Routes
// GET /trending/products - Get currently trending products
/**
 * @swagger
 * /ai/trending/products:
 *   get:
 *     summary: Get AI-detected trending products
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Currently trending products
 */
router.get(
  '/trending/products',
  getTrendingProducts
);

// Section 6: Demand Prediction Routes
// POST /demand/predict - Predict product demand (shop owners and admins)
/**
 * @swagger
 * /ai/demand/predict:
 *   post:
 *     summary: Predict product demand
 *     tags: [AI]
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
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Demand prediction results
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner or admin only
 */
router.post(
  '/demand/predict',
  protect,
  authorize('shop_owner', 'admin'),
  predictDemand
);

// Section 6b: Shop Predictions Route (Seller Analytics Dashboard)
// GET /predictions/shop/:shopId - Live next-month predictions for one shop
/**
 * @swagger
 * /ai/predictions/shop/{shopId}:
 *   get:
 *     summary: Get AI-powered next-month predictions for a shop
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Predicted revenue, daily revenue, expected users, top category, daily revenue forecast, and category sales prediction
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the shop owner or an admin
 *       404:
 *         description: Shop not found
 */
router.get(
  '/predictions/shop/:shopId',
  protect,
  authorize('shop_owner', 'admin'),
  getShopPredictions
);

// Section 7: Health Check Route
// GET /health - Check AI module connection status
/**
 * @swagger
 * /ai/health:
 *   get:
 *     summary: Check AI module connection status
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI module health status
 */
router.get(
  '/health',
  checkAIHealth
);

module.exports = router;
