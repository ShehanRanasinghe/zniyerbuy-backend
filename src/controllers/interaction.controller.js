// User Interaction Tracking Controller

// Records user interactions with products (views, clicks, favorites, purchases) for analytics and recommendation engine purposes.
// Why: Tracking how users interact with products enables the recommendation engine to personalize product suggestions.
// This data also powers analytics dashboards for shop owners.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Track Interaction
// POST /api/v1/interactions
// Records a single user-product interaction event.
// Accepted interaction_type values: 'view', 'click', 'favorite', 'purchase'
// Flow:
//   1. Extract product_id and interaction_type from request body
//   2. Insert a record into user_interactions table with the user's ID
//   3. Return the created interaction record
// Why separate from other controllers: Some interactions (like views) are also tracked in product.controller.js, but this endpoint allows the client to explicitly report interactions for finer-grained tracking.

exports.trackInteraction = asyncHandler(async (req, res) => {
  try {
    const {
      product_id,
      shop_id,
      deal_id,
      action_type,
    } = req.body;

    const { data, error } = await supabase
      .from('user_interactions')
      .insert([
        {
          user_id: req.user.id,
          product_id,
          shop_id,
          deal_id,
          action_type,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Interaction tracked successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});