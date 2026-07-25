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
// Adds a product, shop, or deal to the authenticated user's favorites
// list, based on `type` ('product' | 'shop' | 'deal', defaults to
// 'product' for backward compatibility with existing callers).
// For product favorites only, also updates two denormalized stats via
// Supabase RPC:
//   - increment_product_favorites: increases the product's favorites_count
//   - update_recommendation_score: recalculates the product's recommendation score
// Why RPC calls after insert: favorites_count and recommendation_score are
// denormalized fields on the products table. Updating them via RPC keeps
// aggregated stats accurate without requiring expensive JOINs on every
// product listing query. Shops/deals don't have equivalent denormalized
// counters, so this step is skipped for those types.
exports.addFavorite = asyncHandler(async (req, res) => {
  try {
    const type = req.body.type || 'product';
    const { product_id, shop_id, discount_id } = req.body;

    const insertRow = { user_id: req.user.id, type };
    if (type === 'product') insertRow.product_id = product_id;
    if (type === 'shop') insertRow.shop_id = shop_id;
    if (type === 'deal') insertRow.discount_id = discount_id;

    const { data, error } = await supabase
      .from('favorites')
      .insert([insertRow])
      .select()
      .single();

    if (error) {
      // Postgres unique_violation - this exact favorite already exists.
      // Treat as a success rather than an error, since the end state the
      // client wants ("this is favorited") is already true.
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', req.user.id)
          .eq('type', type)
          .eq(type === 'product' ? 'product_id' : type === 'shop' ? 'shop_id' : 'discount_id',
            type === 'product' ? product_id : type === 'shop' ? shop_id : discount_id)
          .single();

        return res.status(200).json({
          success: true,
          message: 'Already in favorites',
          data: existing || null,
        });
      }
      throw error;
    }

    // Update denormalized product stats via Supabase RPC functions —
    // product favorites only.
    if (type === 'product') {
      await supabase.rpc('increment_product_favorites', { product_id });
      await supabase.rpc('update_recommendation_score', { product_id });
    }

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
// GET /api/v1/favorites?type=product|shop|deal
// Retrieves all favorites for the authenticated user - products, shops,
// and deals alike - optionally filtered to one type. Joins whichever
// entity table applies (a row only ever has one of product_id/shop_id/
// discount_id set, so only one of the three embeds will be non-null on
// any given row) so the client can render the favorites list without
// extra requests.
// Why ordered by created_at descending: Shows most recently favorited
// items first, matching user expectation.
exports.getFavorites = async (req, res) => {
  try {
    let query = supabase
      .from('favorites')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          category,
          is_available
        ),
        shops (
          id,
          name,
          logo_url,
          address,
          category
        ),
        discounts (
          id,
          title,
          deal_price,
          discounted_price,
          image_url,
          shop_id
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (req.query.type) {
      query = query.eq('type', req.query.type);
    }

    const { data, error } = await query;

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

// Section 4: Remove Favorite
// DELETE /api/v1/favorites/:id
// Removes a favorite record (by its own id, not the product id) for the
// authenticated user, then decrements the product's denormalized
// favorites_count via the same RPC family used in addFavorite.
// Why scoped to req.user.id: Prevents one user from deleting another
// user's favorite by guessing/enumerating favorite ids.
// Why this was missing: The mobile app's favoritesAPI.remove(id) call had
// no matching backend route, so "unfavorite" only ever updated local state
// and never persisted server-side.
exports.removeFavorite = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Look up the favorite first so we know which product to decrement
    // and so we can confirm the record belongs to the requesting user.
    const { data: favorite, error: findError } = await supabase
      .from('favorites')
      .select('id, type, product_id, user_id')
      .eq('id', id)
      .single();

    if (findError || !favorite) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found',
      });
    }

    if (favorite.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove this favorite',
      });
    }

    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Best-effort denormalized stat update — mirrors addFavorite's RPC
    // calls. Product favorites only; shops/deals have no equivalent
    // counter. Not fatal if it fails, since the favorite itself is removed.
    if (favorite.type === 'product' && favorite.product_id) {
      try {
        await supabase.rpc('decrement_product_favorites', {
          product_id: favorite.product_id,
        });
      } catch (rpcErr) {
        console.error('[removeFavorite] favorites_count decrement failed:', rpcErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});