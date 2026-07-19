// Shop Review Controller

// Handles creating reviews for shops and retrieving reviews by shop. 
// Reviews include a rating (1-5) and an optional comment.
// Why: Reviews build trust in the marketplace by letting consumers share their experiences with shops. 
// Ratings also feed into the recommendation engine to surface higher-quality shops and products.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Create Review
// POST /api/v1/reviews
// Creates a new review for a shop by the authenticated user.
// Flow:
//   1. Extract shop_id, rating, and comment from request body
//   2. Insert review with the authenticated user's ID
//   3. Return the created review
// FIX APPLIED: Previously called update_product_rating and update_recommendation_score RPCs with an undefined 'product_id' variable. 
// Reviews are for shops (using shop_id), not products.
// Removed the broken RPC calls — if you need to update shop ratings after a review, add an RPC that accepts shop_id instead.

exports.createReview = asyncHandler(async (req, res) => {
  try {
    const {
      shop_id,
      rating,
      comment,
    } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: req.user.id,
          shop_id,
          rating,
          comment,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // NOTE: Previously had broken RPC calls here using undefined 'product_id'. 
    // Reviews are linked to shops via shop_id, not products. 
    // The RPC functions update_product_rating and update_recommendation_score expect a product_id parameter.
    // TODO: Consider creating an 'update_shop_rating' RPC that accepts shop_id to recalculate the shop's average rating after a new review is added.

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get Shop Reviews
// GET /api/v1/reviews/shop/:shopId
// Retrieves all reviews for a specific shop, including the reviewer's name from the users table. 
// Ordered newest-first.
// Why join with users: Displays the reviewer's name alongside their rating and comment, so shoppers can see who wrote each review.

exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          id,
          full_name
        )
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Section 4: Get Product Reviews
// GET /api/v1/reviews/product/:productId
// Retrieves reviews left for a specific product.
exports.getProductReviews = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          id,
          full_name
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data ? data.length : 0,
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 5: Reply to Review
// POST /api/v1/reviews/:reviewId/reply
// Adds a seller reply to a review.
exports.replyToReview = asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        error: 'Reply content is required',
      });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({
        shop_reply: reply,
        shop_reply_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});