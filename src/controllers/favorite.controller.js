// Favorites/Wishlist Controller

// Handles adding products to a user's favorites list and retrieving the user's favorite products. 
// Also updates recommendation scores when a product is favorited.
// Why: Favorites let users save products they're interested in for later. 
// Tracking favorites also feeds into the recommendation engine to suggest similar products to users.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Add Favorite
// POST /api/v1/favorites
// Adds a product to the authenticated user's favorites list.
// After inserting, it calls two Supabase RPC functions:
//   - increment_product_favorites: increases the product's favorites_count
//   - update_recommendation_score: recalculates the product's recommendation score based on the new favorite
// Why RPC calls after insert: The favorites_count and recommendation_score are denormalized fields on the products table. 
// Updating them via RPC keeps aggregated stats accurate without requiring expensive JOINs on every product listing query.

exports.addFavorite = asyncHandler(async (req, res) => {
  try {
    const { product_id } = req.body;

    // Insert a new favorite record linking user and product
    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: req.user.id,
          product_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update denormalized product stats via Supabase RPC functions
    await supabase.rpc('increment_product_favorites', {product_id,});

    await supabase.rpc('update_recommendation_score', {product_id,});

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get User's Favorites
// GET /api/v1/favorites
// Retrieves all favorite products for the authenticated user.
// Joins with the products table to include product details (name, price, image) so the client can display the favorites list without additional API calls.
// Why ordered by created_at descending: Shows most recently favorited products first, matching user expectation.

exports.getFavorites = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          id,
          product_name,
          price,
          image_url
        )
      `)
      .eq('user_id', req.user.id)
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