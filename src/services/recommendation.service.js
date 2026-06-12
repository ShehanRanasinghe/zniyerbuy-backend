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
  await supabase.rpc('update_user_interest', {
    p_user_id: userId,
    p_category: category,
  });
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
 */
exports.trackProductView = async (productId, userId = null, category = null) => {
  // Increment view count
  await exports.incrementViews(productId);

  // Update recommendation score
  await exports.updateProductScore(productId);

  // Record in recently viewed if user is authenticated
  if (userId) {
    await supabase.from('recently_viewed').insert({
      user_id: userId,
      product_id: productId,
    });

    // Update user interest if category is provided
    if (category) {
      await exports.updateUserInterest(userId, category);
    }
  }
};
