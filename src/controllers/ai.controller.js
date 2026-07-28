// AI Controller

// Handles AI-powered features by connecting to the zniyerbuy-ai-module Python service.
// Provides endpoints for product recommendations, demand prediction, trending products, and admin insights.
// Why separate controller: Keeps AI/ML operations isolated and allows the Python AI module to be scaled independently.

// Section 1: Dependencies
const asyncHandler = require('../utils/asyncHandler');
const supabase = require('../config/supabase');

// AI Module base URL - configured via environment variable
const AI_MODULE_URL = process.env.AI_MODULE_URL || 'http://localhost:8000';

// Section 2: Generate AI Insights for Admin Dashboard
// POST /api/v1/ai/insights
// Generates actionable insights based on platform statistics
// Connects to the AI module's insights endpoint
exports.generateInsights = asyncHandler(async (req, res) => {
  try {
    const { platformData } = req.body;

    // Validate platform data
    if (!platformData) {
      return res.status(400).json({
        success: false,
        error: 'Platform data is required',
      });
    }

    // Call AI module for insights generation
    const response = await fetch(`${AI_MODULE_URL}/insights/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platformData }),
    });

    if (!response.ok) {
      throw new Error('AI module request failed');
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      data: data.insights || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate insights',
    });
  }
});

// Section 3: Get Product Recommendations
// GET /api/v1/ai/recommendations/products
// Returns personalized product recommendations for a user
// Connects to the AI module's recommendation engine
exports.getProductRecommendations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    const topN = req.query.top_n || 5;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Call AI module for recommendations
    const response = await fetch(
      `${AI_MODULE_URL}/recommendations/products?user_id=${userId}&top_n=${topN}`
    );

    if (!response.ok) {
      throw new Error('AI module request failed');
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      data: data.recommendations || [],
      method: data.method || 'unknown',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get recommendations',
    });
  }
});

// Section 4: Get Trending Products
// GET /api/v1/ai/trending/products
// Returns currently trending products based on recent activity
// Connects to the AI module's trending analysis
exports.getTrendingProducts = asyncHandler(async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    // Call AI module for trending products
    const response = await fetch(
      `${AI_MODULE_URL}/trending/products?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('AI module request failed');
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      data: data.trending || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get trending products',
    });
  }
});

// Section 5: Predict Product Demand
// POST /api/v1/ai/demand/predict
// Predicts future demand for a product based on historical data
// Connects to the AI module's demand prediction model
exports.predictDemand = asyncHandler(async (req, res) => {
  try {
    const { productId, days } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
    }

    // Call AI module for demand prediction
    const response = await fetch(`${AI_MODULE_URL}/demand/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        days: days || 7,
      }),
    });

    if (!response.ok) {
      throw new Error('AI module request failed');
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      data: data.prediction || {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to predict demand',
    });
  }
});

// Section 6: Get Shop AI Predictions (Seller Analytics Dashboard)
// GET /api/v1/ai/predictions/shop/:shopId
// Returns next-month predictions (revenue, daily revenue, expected users,
// top category, daily revenue forecast, category sales prediction) for a
// single shop, computed live by the AI module from that shop's real
// orders + products. Powers the "AI-Powered Predictions for Next Month"
// section on the seller Analytics page.
// Why verify ownership: the AI module trusts whatever shop_id it's given,
// so this route is the one place that checks the requesting user actually
// owns (or administers) the shop before proxying the request through.
exports.getShopPredictions = asyncHandler(async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        error: 'Shop ID is required',
      });
    }

    // Admins can view predictions for any shop; shop owners only their own.
    if (req.user.role !== 'admin') {
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id, owner_id')
        .eq('id', shopId)
        .single();

      if (shopError || !shop) {
        return res.status(404).json({
          success: false,
          error: 'Shop not found',
        });
      }

      if (shop.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "You do not have access to this shop's predictions",
        });
      }
    }

    // Call AI module for live shop predictions
    let response;
    try {
      response = await fetch(`${AI_MODULE_URL}/predictions/shop/${shopId}`);
    } catch (networkErr) {
      // fetch() throws (not a rejected response) when the AI module can't
      // be reached at all — wrong port, service not started, crashed, etc.
      return res.status(503).json({
        success: false,
        error: 'AI prediction service is currently unavailable. Please make sure the AI module is running and try again.',
      });
    }

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: `AI module responded with an error (status ${response.status}).`,
      });
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get shop predictions',
    });
  }
});

// Section 7: Health Check for AI Module Connection
// GET /api/v1/ai/health
// Checks if the AI module is reachable and responding
exports.checkAIHealth = asyncHandler(async (req, res) => {
  try {
    const response = await fetch(`${AI_MODULE_URL}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('AI module is not responding');
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      aiModule: {
        status: 'connected',
        url: AI_MODULE_URL,
        version: data.version || 'unknown',
      },
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      aiModule: {
        status: 'disconnected',
        url: AI_MODULE_URL,
        error: err.message,
      },
    });
  }
});