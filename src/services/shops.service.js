// Shops Service
// Centralizes all shop-related business logic including CRUD operations,
// geolocation queries, ownership verification, and shop analytics.
// Why: Reduces code duplication across controllers and provides reusable shop operations.

const supabase = require('../config/supabase');
const haversineDistanceKm = require('../utils/haversineDistanceKm');

/**
 * Create a new shop
 * @param {object} shopData - Shop creation data
 * @param {string} shopData.owner_id - Owner user ID
 * @param {string} shopData.name - Shop name
 * @param {string} shopData.description - Shop description
 * @param {string} shopData.category - Shop category
 * @param {string} shopData.address - Shop address
 * @param {string} shopData.city - Shop city
 * @param {number} shopData.latitude - Shop latitude
 * @param {number} shopData.longitude - Shop longitude
 * @param {string} shopData.phone - Shop phone
 * @param {string} [shopData.email] - Shop email
 * @param {string} [shopData.logo_url] - Shop logo URL
 * @param {string} [shopData.cover_image_url] - Shop cover image URL
 * @returns {Promise<{data, error}>}
 */
exports.createShop = async (shopData) => {
  const {
    owner_id,
    name,
    description,
    category = 'other',
    address,
    city,
    latitude,
    longitude,
    phone,
    email,
    logo_url,
    cover_image_url,
  } = shopData;

  return await supabase
    .from('shops')
    .insert([
      {
        owner_id,
        name,
        description,
        category,
        address,
        city,
        latitude,
        longitude,
        phone,
        email,
        logo_url,
        cover_image_url,
      },
    ])
    .select()
    .single();
};

/**
 * Get shop by ID
 * @param {string} shopId - Shop UUID
 * @param {boolean} [includeProducts=false] - Include shop products
 * @param {boolean} [includeDeals=false] - Include shop deals
 * @returns {Promise<{data, error}>}
 */
exports.getShopById = async (shopId, includeProducts = false, includeDeals = false) => {
  let selectQuery = '*';

  if (includeProducts && includeDeals) {
    selectQuery = `
      *,
      products (
        id,
        name,
        price,
        image_url,
        is_available
      ),
      discounts (
        id,
        title,
        discount_type,
        discount_value,
        deal_price,
        is_active
      )
    `;
  } else if (includeProducts) {
    selectQuery = `
      *,
      products (
        id,
        name,
        price,
        image_url,
        is_available
      )
    `;
  } else if (includeDeals) {
    selectQuery = `
      *,
      discounts (
        id,
        title,
        discount_type,
        discount_value,
        deal_price,
        is_active
      )
    `;
  }

  return await supabase
    .from('shops')
    .select(selectQuery)
    .eq('id', shopId)
    .single();
};

/**
 * Get shop by ID including products and deals (convenience alias)
 * @param {string} shopId - Shop UUID
 * @returns {Promise<{data, error}>}
 */
exports.getShopWithDetails = async (shopId) => {
  return await exports.getShopById(shopId, true, true);
};

/**
 * Get shops by owner ID
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<{data, error}>}
 */
exports.getShopsByOwner = async (ownerId) => {
  return await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
};

/**
 * Get nearby shops using geolocation
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} [radius=10] - Search radius in kilometers
 * @param {object} [options] - Additional options
 * @param {string} [options.category] - Filter by category
 * @param {boolean} [options.verifiedOnly=false] - Only verified shops
 * @param {boolean} [options.activeOnly=true] - Only active shops
 * @returns {Promise<{data, error}>}
 */
exports.getNearbyShops = async (latitude, longitude, radius = 10, options = {}) => {
  const { category, verifiedOnly = false, activeOnly = true } = options;

  // NOTE: This used to append a raw SQL math expression
  // ('(6371 * acos(...)) AS distance') directly into the Supabase
  // .select() string. PostgREST's select parameter only understands
  // column names, embedded resources, and pre-registered SQL "computed
  // column" functions — not arbitrary inline arithmetic with AS — so that
  // was an invalid query and every call to GET /shops/nearby failed with
  // a parse error. Distance is now computed in plain JS after fetching,
  // using the same haversine helper as products/nearby.
  let query = supabase
    .from('shops')
    .select('*')
    .gte('latitude', latitude - 1)
    .lte('latitude', latitude + 1)
    .gte('longitude', longitude - 1)
    .lte('longitude', longitude + 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (verifiedOnly) {
    query = query.eq('is_verified', true);
  }

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) return { data: null, error };

  const withDistance = (data || [])
    .map((shop) => ({
      ...shop,
      distance: haversineDistanceKm(latitude, longitude, shop.latitude, shop.longitude),
    }))
    .filter((shop) => shop.distance != null && shop.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .map((shop) => ({ ...shop, distance: Number(shop.distance.toFixed(2)) }));

  return { data: withDistance, error: null };
};

/**
 * Update shop
 * @param {string} shopId - Shop UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
exports.updateShop = async (shopId, updates) => {
  // Remove fields that shouldn't be updated directly
  const { id, owner_id, created_at, ...allowedUpdates } = updates;

  return await supabase
    .from('shops')
    .update(allowedUpdates)
    .eq('id', shopId)
    .select()
    .single();
};

/**
 * Update shop images
 * @param {string} shopId - Shop UUID
 * @param {object} images - Image URLs
 * @param {string} [images.logo_url] - Logo URL
 * @param {string} [images.cover_image_url] - Cover image URL
 * @returns {Promise<{data, error}>}
 */
exports.updateShopImages = async (shopId, images) => {
  const updateData = {};
  
  if (images.logo_url) updateData.logo_url = images.logo_url;
  if (images.cover_image_url) updateData.cover_image_url = images.cover_image_url;

  if (Object.keys(updateData).length === 0) {
    return {
      data: null,
      error: { message: 'No image URLs provided', code: 'NO_IMAGES' },
    };
  }

  return await supabase
    .from('shops')
    .update(updateData)
    .eq('id', shopId)
    .select()
    .single();
};

/**
 * Verify shop (admin only)
 * @param {string} shopId - Shop UUID
 * @param {boolean} verified - Verification status
 * @returns {Promise<{data, error}>}
 */
exports.verifyShop = async (shopId, verified = true) => {
  return await supabase
    .from('shops')
    .update({
      is_verified: verified,
      is_active: verified, // Activate when verified
    })
    .eq('id', shopId)
    .select()
    .single();
};

/**
 * Toggle shop active status
 * @param {string} shopId - Shop UUID
 * @param {boolean} active - Active status
 * @returns {Promise<{data, error}>}
 */
exports.toggleShopStatus = async (shopId, active) => {
  return await supabase
    .from('shops')
    .update({ is_active: active })
    .eq('id', shopId)
    .select()
    .single();
};

/**
 * Delete shop
 * @param {string} shopId - Shop UUID
 * @returns {Promise<{data, error}>}
 */
exports.deleteShop = async (shopId) => {
  return await supabase
    .from('shops')
    .delete()
    .eq('id', shopId)
    .select()
    .single();
};

/**
 * Check if user owns shop
 * @param {string} userId - User UUID
 * @param {string} shopId - Shop UUID
 * @returns {Promise<boolean>}
 */
exports.isShopOwner = async (userId, shopId) => {
  const { data, error } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single();

  if (error || !data) return false;
  return data.owner_id === userId;
};

/**
 * Get all shops (admin only)
 * @param {object} options - Query options
 * @param {number} [options.limit] - Limit results
 * @param {number} [options.offset] - Offset for pagination
 * @param {string} [options.category] - Filter by category
 * @param {boolean} [options.verified] - Filter by verification status
 * @param {boolean} [options.active] - Filter by active status
 * @param {string} [options.orderBy='created_at'] - Order by field
 * @param {boolean} [options.ascending=false] - Sort order
 * @returns {Promise<{data, error}>}
 */
exports.getAllShops = async (options = {}) => {
  const {
    limit,
    offset,
    category,
    verified,
    active,
    orderBy = 'created_at',
    ascending = false,
  } = options;

  let query = supabase
    .from('shops')
    .select('*, users!owner_id(full_name, email)');

  if (category) {
    query = query.eq('category', category);
  }

  if (verified !== undefined) {
    query = query.eq('is_verified', verified);
  }

  if (active !== undefined) {
    query = query.eq('is_active', active);
  }

  query = query.order(orderBy, { ascending });

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  return await query;
};

/**
 * Count shops
 * @param {object} filters - Filter options
 * @param {string} [filters.category] - Filter by category
 * @param {boolean} [filters.verified] - Filter by verification status
 * @param {boolean} [filters.active] - Filter by active status
 * @param {string} [filters.owner_id] - Filter by owner
 * @returns {Promise<number>}
 */
exports.countShops = async (filters = {}) => {
  const { category, verified, active, owner_id } = filters;

  let query = supabase
    .from('shops')
    .select('*', { count: 'exact', head: true });

  if (category) query = query.eq('category', category);
  if (verified !== undefined) query = query.eq('is_verified', verified);
  if (active !== undefined) query = query.eq('is_active', active);
  if (owner_id) query = query.eq('owner_id', owner_id);

  const { count } = await query;
  return count || 0;
};

/**
 * Get shop statistics
 * @param {string} shopId - Shop UUID
 * @returns {Promise<{data, error}>}
 */
exports.getShopStats = async (shopId) => {
  const [productsResult, dealsResult, reviewsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    supabase
      .from('discounts')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    supabase
      .from('reviews')
      .select('rating')
      .eq('shop_id', shopId),
  ]);

  const totalProducts = productsResult.count || 0;
  const totalDeals = dealsResult.count || 0;
  const reviews = reviewsResult.data || [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    data: {
      totalProducts,
      totalDeals,
      totalReviews,
      averageRating: Number(averageRating.toFixed(2)),
    },
    error: null,
  };
};

/**
 * Search shops by name or description
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @param {number} [options.limit=20] - Limit results
 * @param {string} [options.category] - Filter by category
 * @param {boolean} [options.verifiedOnly=false] - Only verified shops
 * @returns {Promise<{data, error}>}
 */
exports.searchShops = async (query, options = {}) => {
  const { limit = 20, category, verifiedOnly = false } = options;

  let searchQuery = supabase
    .from('shops')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  if (category) {
    searchQuery = searchQuery.eq('category', category);
  }

  if (verifiedOnly) {
    searchQuery = searchQuery.eq('is_verified', true);
  }

  searchQuery = searchQuery.limit(limit);

  return await searchQuery;
};