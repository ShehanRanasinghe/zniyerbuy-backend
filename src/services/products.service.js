// Products Service
// Centralizes all product-related business logic including CRUD operations,
// search, filtering, recommendations, and product analytics.
// Why: Reduces code duplication and provides reusable product operations across controllers.

const supabase = require('../config/supabase');

/**
 * Create a new product
 * @param {object} productData - Product creation data
 * @param {string} productData.shop_id - Shop UUID
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {number} productData.original_price - Original price
 * @param {number} [productData.current_price] - Current price (defaults to original_price)
 * @param {string} [productData.unit='piece'] - Unit type
 * @param {number} [productData.stock_quantity=0] - Stock quantity
 * @param {string} [productData.image_url] - Product image URL
 * @param {string} [productData.category] - Product category
 * @returns {Promise<{data, error}>}
 */
exports.createProduct = async (productData) => {
  const {
    shop_id,
    name,
    description,
    original_price,
    current_price,
    unit = 'piece',
    stock_quantity = 0,
    image_url,
    category,
  } = productData;

  const now = new Date();

  return await supabase
    .from('products')
    .insert([
      {
        shop_id,
        name,
        description,
        original_price,
        current_price: current_price || original_price,
        unit,
        stock_quantity,
        image_url,
        category,
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();
};

/**
 * Get product by ID
 * @param {string} productId - Product UUID
 * @param {boolean} [includeShop=false] - Include shop details
 * @returns {Promise<{data, error}>}
 */
exports.getProductById = async (productId, includeShop = false) => {
  const selectQuery = includeShop
    ? `
      *,
      shops (
        id,
        name,
        address,
        phone,
        city
      )
    `
    : '*';

  return await supabase
    .from('products')
    .select(selectQuery)
    .eq('id', productId)
    .single();
};

/**
 * Get products by shop ID
 * @param {string} shopId - Shop UUID
 * @param {object} options - Query options
 * @param {boolean} [options.availableOnly=false] - Only available products
 * @param {number} [options.limit] - Limit results
 * @returns {Promise<{data, error}>}
 */
exports.getProductsByShop = async (shopId, options = {}) => {
  const { availableOnly = false, limit } = options;

  let query = supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (availableOnly) {
    query = query.eq('is_available', true);
  }

  if (limit) {
    query = query.limit(limit);
  }

  return await query;
};

/**
 * Get all products with pagination and filters
 * @param {object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.keyword] - Search keyword
 * @param {string} [options.sort='newest'] - Sort order (newest, price_asc, price_desc)
 * @param {boolean} [options.availableOnly=false] - Only available products
 * @returns {Promise<{data, error, page, limit, count}>}
 */
exports.getAllProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    keyword,
    sort = 'newest',
    availableOnly = false,
  } = options;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name
      )
    `);

  if (category) {
    query = query.eq('category', category);
  }

  if (keyword) {
    query = query.ilike('name', `%${keyword}%`);
  }

  if (availableOnly) {
    query = query.eq('is_available', true);
  }

  // Apply sorting
  let orderField = 'created_at';
  let ascending = false;

  if (sort === 'price_asc') {
    orderField = 'current_price';
    ascending = true;
  } else if (sort === 'price_desc') {
    orderField = 'current_price';
    ascending = false;
  }

  const { data, error } = await query
    .order(orderField, { ascending })
    .range(from, to);

  return {
    data,
    error,
    page,
    limit,
    count: data?.length || 0,
  };
};

/**
 * Get products with pagination and filters (alias for getAllProducts)
 * @param {object} options - Query options (same as getAllProducts)
 * @returns {Promise<{data, error, page, limit, count}>}
 */
exports.getProducts = async (options = {}) => {
  return await exports.getAllProducts(options);
};

/**
 * Update product
 * @param {string} productId - Product UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
exports.updateProduct = async (productId, updates) => {
  // Remove fields that shouldn't be updated directly
  const { id, shop_id, created_at, views, favorites_count, ...allowedUpdates } = updates;

  return await supabase
    .from('products')
    .update(allowedUpdates)
    .eq('id', productId)
    .select()
    .single();
};

/**
 * Update product image
 * @param {string} productId - Product UUID
 * @param {string} imageUrl - New image URL
 * @returns {Promise<{data, error}>}
 */
exports.updateProductImage = async (productId, imageUrl) => {
  return await supabase
    .from('products')
    .update({ image_url: imageUrl })
    .eq('id', productId)
    .select()
    .single();
};

/**
 * Update product availability
 * @param {string} productId - Product UUID
 * @param {boolean} available - Availability status
 * @returns {Promise<{data, error}>}
 */
exports.updateProductAvailability = async (productId, available) => {
  return await supabase
    .from('products')
    .update({ is_available: available })
    .eq('id', productId)
    .select()
    .single();
};

/**
 * Update product stock
 * @param {string} productId - Product UUID
 * @param {number} quantity - New stock quantity
 * @returns {Promise<{data, error}>}
 */
exports.updateProductStock = async (productId, quantity) => {
  return await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('id', productId)
    .select()
    .single();
};

/**
 * Delete product
 * @param {string} productId - Product UUID
 * @returns {Promise<{data, error}>}
 */
exports.deleteProduct = async (productId) => {
  return await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .select()
    .single();
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @param {number} [options.limit=20] - Limit results
 * @param {string} [options.category] - Filter by category
 * @param {boolean} [options.availableOnly=true] - Only available products
 * @returns {Promise<{data, error}>}
 */
exports.searchProducts = async (query, options = {}) => {
  const { limit = 20, category, availableOnly = true } = options;

  let searchQuery = supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name
      )
    `)
    .ilike('name', `%${query}%`);

  if (category) {
    searchQuery = searchQuery.eq('category', category);
  }

  if (availableOnly) {
    searchQuery = searchQuery.eq('is_available', true);
  }

  searchQuery = searchQuery
    .order('created_at', { ascending: false })
    .limit(limit);

  return await searchQuery;
};

/**
 * Get trending products
 * @param {number} [limit=10] - Number of products to return
 * @returns {Promise<{data, error}>}
 */
exports.getTrendingProducts = async (limit = 10) => {
  return await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        address
      )
    `)
    .order('average_rating', { ascending: false })
    .order('favorites_count', { ascending: false })
    .order('views', { ascending: false })
    .order('recommendation_score', { ascending: false })
    .limit(limit);
};

/**
 * Get similar products (same category)
 * @param {string} productId - Product UUID
 * @param {number} [limit=10] - Number of products to return
 * @returns {Promise<{data, error}>}
 */
exports.getSimilarProducts = async (productId, limit = 10) => {
  // First get the product's category
  const { data: product, error: productError } = await exports.getProductById(productId);

  if (productError || !product) {
    return { data: null, error: productError || { message: 'Product not found' } };
  }

  // Get products in same category, excluding current product
  return await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        address
      )
    `)
    .eq('category', product.category)
    .neq('id', productId)
    .order('recommendation_score', { ascending: false })
    .limit(limit);
};

/**
 * Check if user owns product (via shop ownership)
 * @param {string} userId - User UUID
 * @param {string} productId - Product UUID
 * @returns {Promise<boolean>}
 */
exports.isProductOwner = async (userId, productId) => {
  const { data, error } = await supabase
    .from('products')
    .select('shop_id, shops!shop_id(owner_id)')
    .eq('id', productId)
    .single();

  if (error || !data) return false;
  return data.shops?.owner_id === userId;
};

/**
 * Count products
 * @param {object} filters - Filter options
 * @param {string} [filters.shop_id] - Filter by shop
 * @param {string} [filters.category] - Filter by category
 * @param {boolean} [filters.available] - Filter by availability
 * @returns {Promise<number>}
 */
exports.countProducts = async (filters = {}) => {
  const { shop_id, category, available } = filters;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (shop_id) query = query.eq('shop_id', shop_id);
  if (category) query = query.eq('category', category);
  if (available !== undefined) query = query.eq('is_available', available);

  const { count } = await query;
  return count || 0;
};

/**
 * Get product statistics
 * @param {string} productId - Product UUID
 * @returns {Promise<{data, error}>}
 */
exports.getProductStats = async (productId) => {
  const { data: product, error } = await supabase
    .from('products')
    .select('views, favorites_count, average_rating, total_reviews, recommendation_score')
    .eq('id', productId)
    .single();

  if (error) return { data: null, error };

  return {
    data: {
      views: product.views || 0,
      favorites: product.favorites_count || 0,
      averageRating: product.average_rating || 0,
      totalReviews: product.total_reviews || 0,
      recommendationScore: product.recommendation_score || 0,
    },
    error: null,
  };
};

/**
 * Get products by category
 * @param {string} category - Product category
 * @param {number} [limit=20] - Limit results
 * @returns {Promise<{data, error}>}
 */
exports.getProductsByCategory = async (category, limit = 20) => {
  return await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name
      )
    `)
    .eq('category', category)
    .eq('is_available', true)
    .order('recommendation_score', { ascending: false })
    .limit(limit);
};

/**
 * Get low stock products for a shop
 * @param {string} shopId - Shop UUID
 * @param {number} [threshold=10] - Stock threshold
 * @returns {Promise<{data, error}>}
 */
exports.getLowStockProducts = async (shopId, threshold = 10) => {
  return await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .lte('stock_quantity', threshold)
    .order('stock_quantity', { ascending: true });
};

/**
 * Bulk update product availability
 * @param {string[]} productIds - Array of product UUIDs
 * @param {boolean} available - Availability status
 * @returns {Promise<{data, error}>}
 */
exports.bulkUpdateAvailability = async (productIds, available) => {
  return await supabase
    .from('products')
    .update({ is_available: available })
    .in('id', productIds)
    .select();
};

/**
 * Get recently added products
 * @param {number} [limit=10] - Number of products to return
 * @param {string} [shopId] - Optional shop filter
 * @returns {Promise<{data, error}>}
 */
exports.getRecentProducts = async (limit = 10, shopId = null) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (shopId) {
    query = query.eq('shop_id', shopId);
  }

  return await query;
};
