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
  checkAIHealth,
} = require('../controllers/ai.controller');

// Section 3: Admin AI Routes
// POST /insights - Generate AI insights for admin dashboard (admin only)
router.post(
  '/insights',
  protect,
  authorize('admin'),
  generateInsights
);

// Section 4: Recommendation Routes
// GET /recommendations/products - Get personalized product recommendations
router.get(
  '/recommendations/products',
  protect,
  getProductRecommendations
);

// Section 5: Trending Routes
// GET /trending/products - Get currently trending products
router.get(
  '/trending/products',
  getTrendingProducts
);

// Section 6: Demand Prediction Routes
// POST /demand/predict - Predict product demand (shop owners and admins)
router.post(
  '/demand/predict',
  protect,
  authorize('shop_owner', 'admin'),
  predictDemand
);

// Section 7: Health Check Route
// GET /health - Check AI module connection status
router.get(
  '/health',
  checkAIHealth
);

module.exports = router;
