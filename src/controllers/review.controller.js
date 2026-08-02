// Shop Review Controller

// Handles creating reviews for shops and retrieving reviews by shop. 
// Reviews include a rating (1-5) and an optional comment.
// Why: Reviews build trust in the marketplace by letting consumers share their experiences with shops. 
// Ratings also feed into the recommendation engine to surface higher-quality shops and products.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

// Section 2: Create Review
// POST /api/v1/reviews
// Creates a new review for a shop (and, optionally, a specific product)
// by the authenticated user.
// Flow:
//   1. Extract shop_id, product_id, rating, and comment from request body
//   2. Insert review with the authenticated user's ID
//   3. If product_id was provided, recalculate that product's average_rating
//   4. Return the created review
// FIX APPLIED: product_id is now accepted and stored. It was previously
// dropped entirely, which meant reviews.product_id was always NULL and
// GET /reviews/product/:productId (used by shop-web's Reviews page and
// product detail pages) never returned anything, even for products that
// had been rated on the mobile app.

exports.createReview = asyncHandler(async (req, res) => {
  try {
    const {
      shop_id,
      product_id,
      rating,
      comment,
    } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          id: uuidv4(),
          user_id: req.user.id,
          shop_id: shop_id || null,
          product_id: product_id || null,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Recalculate the product's average_rating so shop-web and the mobile
    // product page reflect the new review immediately.
    if (product_id) {
      const { data: productReviews, error: avgError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product_id);

      if (!avgError && productReviews && productReviews.length > 0) {
        const avg =
          productReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
          productReviews.length;

        await supabase
          .from('products')
          .update({ average_rating: Math.round(avg * 10) / 10 })
          .eq('id', product_id);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data,
    });
  } catch (err) {
    console.error('[createReview] Failed to create review:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
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

// Section 3b: Get My Reviews
// GET /api/v1/reviews/mine
// Returns only the reviews written by the authenticated user, with the
// shop name (and product name, when the review is product-linked)
// attached. Backs the Profile page's overview "ratings" section, which
// must show the customer's own reviews only — not other customers'.
exports.getMyReviews = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        shops (
          id,
          name,
          logo_url
        ),
        products (
          id,
          name,
          image_url
        )
      `)
      .eq('user_id', req.user.id)
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