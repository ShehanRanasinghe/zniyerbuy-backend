// Recommendation Service
// Handles product recommendation logic and scoring algorithms.
// Why: Centralizes recommendation logic that's used across multiple controllers.

const supabase = require('../config/supabase');

/**
 * Update product recommendation score
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
exports.updateProductScore = async (productId) => {
  await supabase.rpc('update_recommendation_score', {
    product_id: productId,
  });
};

/**
 * Increment product view count
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
exports.incrementViews = async (productId) => {
  await supabase.rpc('increment_product_views', {
    product_id: productId,
  });
};

/**
 * Increment product favorites count
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
exports.incrementFavorites = async (productId) => {
  await supabase.rpc('increment_product_favorites', {
    product_id: productId,
  });
};

/**
 * Update user interest score for a category
 * @param {string} userId - User ID
 * @param {string} category - Product category
 * @returns {Promise<void>}
 */
exports.updateUserInterest = async (userId, category) => {
  const { error } = await supabase.rpc('update_user_interest', {
    p_user_id: userId,
    p_category: category,
  });
  if (error) {
    // Most likely cause: the update_user_interest RPC's `ON CONFLICT
    // (user_id, category)` clause has no matching unique constraint to
    // target - see the 20260731-add-user-interests-unique-constraint
    // migration, which creates both the constraint and this function.
    console.error('[updateUserInterest] RPC failed:', error.message);
    throw error;
  }
};

/**
 * Get recommended products for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<{data, error}>}
 */
exports.getRecommendations = async (userId, limit = 10) => {
  // Get viewed product IDs
  const { data: viewedProducts } = await supabase
    .from('recently_viewed')
    .select('product_id')
    .eq('user_id', userId);

  const viewedIds = viewedProducts?.map((item) => item.product_id) || [];

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        address
      )
    `)
    .order('recommendation_score', { ascending: false })
    .limit(limit);

  // Exclude viewed products if any exist
  if (viewedIds.length > 0) {
    query = query.not('id', 'in', `(${viewedIds.join(',')})`);
  }

  return await query;
};

/**
 * Get interest-based recommendations
 * @param {string} userId - User ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<{data, error, interests}>}
 */
exports.getInterestBasedRecommendations = async (userId, limit = 10) => {
  // Get user's top interest categories
  const { data: interests } = await supabase
    .from('user_interests')
    .select('category')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(3);

  const categories = interests?.map((item) => item.category) || [];

  // Query products in those categories
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        address
      )
    `)
    .in('category', categories)
    .order('recommendation_score', { ascending: false })
    .limit(limit);

  return { data, error, interests: categories };
};

/**
 * Track product view and update scores
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (optional)
 * @param {string} category - Product category (optional)
 * @returns {Promise<void>}
 * FIX APPLIED: Each step below is now independently try/caught. The
 * supabase-js client mostly returns {data, error} rather than throwing,
 * and none of these calls previously checked `error`, so a Postgres-side
 * failure (e.g. a missing RPC function, or update_user_interest's
 * ON CONFLICT target not existing) was already being silently swallowed
 * rather than surfaced - but a network-level failure calling out to
 * Supabase does throw, and would propagate up through getProductById's
 * await and turn the whole product detail page into a 500. Wrapping each
 * step ensures a tracking failure of any kind can never break product
 * viewing itself.
 */
exports.trackProductView = async (productId, userId = null, category = null) => {
  // Increment view count
  try {
    await exports.incrementViews(productId);
  } catch (err) {
    console.error('[trackProductView] incrementViews failed:', err.message);
  }

  // Update recommendation score
  try {
    await exports.updateProductScore(productId);
  } catch (err) {
    console.error('[trackProductView] updateProductScore failed:', err.message);
  }

  // Record in recently viewed if user is authenticated
  if (userId) {
    try {
      await supabase.from('recently_viewed').insert({
        user_id: userId,
        product_id: productId,
      });
    } catch (err) {
      console.error('[trackProductView] recently_viewed insert failed:', err.message);
    }

    // Update user interest if category is provided
    if (category) {
      try {
        await exports.updateUserInterest(userId, category);
      } catch (err) {
        console.error('[trackProductView] updateUserInterest failed:', err.message);
      }
    }
  }
};
