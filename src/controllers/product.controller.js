//  Product Management Controller

// The largest controller in the application. Handles all product-related operations including CRUD, search, recommendations, trending products, home feed generation, and search history tracking.
// Why so many endpoints: Products are the core entity of the ZNIYERBUY marketplace. 
// The recommendation engine, search system, and personalized feeds all revolve around product data.

// Section 1: Dependencies
const { products, recommendation } = require('../services');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Create Product
// POST /api/v1/products
// Creates a new product listing in the marketplace.
// Flow:
//   1. Extract product data from request body
//   2. Insert into the 'products' table with the provided shop_id
//   3. Return the created product
// Why shop_id is required: Every product belongs to a shop. The shop_id links the product to the business selling it.

exports.createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      shop_id,
      name,
      description,
      original_price,
      current_price,
      unit,
      stock_quantity,
      image_url,
      category,
    } = req.body;

    // Use products service to create product
    const { data, error } = await products.createProduct({
      shop_id,
      name,
      description,
      original_price,
      current_price: current_price || original_price,
      unit: unit || 'piece',
      stock_quantity,
      image_url,
      category,
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get Products (Paginated & Filterable)
// GET /api/v1/products?page=1&limit=10&category=...&sort=...&keyword=...
// Retrieves a paginated list of products with optional filtering by category, keyword search, and sorting.
// Query Parameters:
//   - page: page number (default: 1)
//   - limit: items per page (default: 10)
//   - category: filter by product category
//   - keyword: search by product name (partial match)
//   - sort: 'newest' (default), 'price_asc', 'price_desc'
// Why pagination with range(): Supabase's .range(from, to) maps directly to SQL OFFSET/LIMIT, enabling efficient pagination without loading all products into memory.

exports.getProducts = asyncHandler(async (req, res) => {
  // Parse pagination parameters with sensible defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const sort = req.query.sort || 'newest';
  const keyword = req.query.keyword;

  try {
    // Use products service to get products with filters
    const { data, error } = await products.getProducts({
      page,
      limit,
      category,
      sort,
      keyword,
    });

    if (error) throw error;

    res.status(200).json({
      success: true,
      page,
      limit,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 4: Get Trending Products
// GET /api/v1/products/trending?limit=10
// Returns the most popular products based on a multi-factor ranking: average_rating > favorites_count > views > recommendation_score.
// Why multi-order: Using multiple sort criteria creates a composite ranking where highly-rated products appear first, with ties broken by favorites, then views, then recommendation score.

exports.getTrendingProducts = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Use products service to get trending products
    const { data, error } = await products.getTrendingProducts(limit);

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
});

// Section 5: Get Recently Viewed Products
// GET /api/v1/products/recently-viewed
// Returns the last 10 products the authenticated user has viewed.
// Data comes from the 'recently_viewed' table which is populated when a user visits a product detail page (getProductById).
// Why limited to 10: Keeps the recently-viewed list manageable and matches common UI patterns for recently viewed carousels.

exports.getRecentlyViewedProducts = asyncHandler(async (req, res) => {
  try {
    // Use products service to get recently viewed products
    const { data, error } = await products.getRecentlyViewedProducts(req.user.id);

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
});

// Section 6: Get Recommended Products
// GET /api/v1/products/recommended
// Returns product recommendations by filtering out already-viewed products and sorting by recommendation_score.
// Flow:
//   1. Fetch all product IDs the user has recently viewed
//   2. Query products excluding those IDs
//   3. Sort by recommendation_score (highest first)
//   4. Limit to 10 results
// Why exclude viewed products: Recommendations should surface NEW products the user hasn't seen yet, not repeat what they've browsed.

exports.getRecommendedProducts = asyncHandler(async (req, res) => {
  try {
    // Use recommendation service to get recommended products
    const { data, error } = await recommendation.getRecommendedProducts(req.user.id);

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
});

// Section 7: Get Interest-Based Recommendations
// GET /api/v1/products/interest-based
// Returns product recommendations based on the user's tracked interest categories. 
// Uses the 'user_interests' table which scores categories based on user behavior (views, favorites, etc.).
// Flow:
//   1. Fetch the user's top 3 interest categories by score
//   2. Query products in those categories
//   3. Sort by recommendation_score
//   4. Return top 10 results
// Why top 3 categories: Balances personalization depth with result diversity. Too few categories = too narrow; too many = too broad.

exports.getInterestBasedRecommendations = asyncHandler(async (req, res) => {
  try {
    // Use recommendation service to get interest-based recommendations
    const { data, categories, error } = await recommendation.getInterestBasedRecommendations(req.user.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      interests: categories,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 8: Get Home Feed
// GET /api/v1/products/home-feed
// Generates a personalized home feed for the authenticated user.
// Similar to interest-based recommendations but with a larger result set (20 items) and top 5 interest categories.
// Flow:
//   1. Fetch user's top 5 interest categories
//   2. If user has interests, filter products by those categories
//   3. Sort by recommendation_score
//   4. Return top 20 products
// Why larger limits: The home feed is the main discovery surface, so it needs more content than specialized recommendation endpoints.

exports.getHomeFeed = asyncHandler(async (req, res) => {
  try {
    const { data: interests } = await supabase
      .from('user_interests')
      .select('category')
      .eq('user_id', req.user.id)
      .order('score', { ascending: false })
      .limit(5);

    const categories = interests.map(
      (item) => item.category
    );

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
      .order('recommendation_score', {
        ascending: false,
      })
      .limit(20);

    // Only filter by categories if the user has tracked interests. New users with no interests get a general top-products feed.
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      interests: categories,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 9: Get Similar Products
// GET /api/v1/products/:id/similar
// Returns products in the same category as the specified product, excluding the product itself. 
// Useful for You might also like sections on product detail pages.
// Flow:
//   1. Look up the target product to get its category
//   2. Query other products in the same category
//   3. Sort by recommendation_score
//   4. Return top 10 similar products
// Why two queries: We need the category of the target product first, then can filter by it. This avoids complex self-joins.

exports.getSimilarProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // First, fetch the target product to determine its category
    const { data: currentProduct, error: currentError } =
      await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (currentError || !currentProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Query products in the same category, excluding the current one
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
      .eq('category', currentProduct.category)
      .neq('id', id)
      .order('recommendation_score', {
        ascending: false,
      })
      .limit(10);

    if (error) throw error;

    res.status(200).json({
      success: true,
      category: currentProduct.category,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 10: Get Recently Trending Products
// GET /api/v1/products/recently-trending
// Returns products with a recommendation_score >= 5, indicating they are currently popular based on recent user activity.
// Why threshold of 5: Acts as a quality filter to only show products with significant engagement, not every product.

exports.getRecentlyTrendingProducts = asyncHandler(async (req, res) => {
  try {
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
      .gte('recommendation_score', 5)
      .order('recommendation_score', {
        ascending: false,
      })
      .limit(10);

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      ranking: 'recommendation_score',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 11: Search Products
// GET /api/v1/products/search?q=...
// Searches for products by name using case-insensitive partial matching.
// Also logs the search query to search_history for the authenticated user.
// FIX APPLIED: Previously referenced undefined variable 'keyword' instead of the query parameter 'q'. Fixed to use 'q' consistently.
// Also fixed column name from 'name' to 'product_name' to match the actual database schema.

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (req.user && q?.trim()) {
      await supabase
        .from('search_history')
        .insert({
          user_id: req.user.id,
          keyword: q,
        });
    }

    // Search for products by name using case-insensitive match
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops (
          id,
          name
        )
      `)
      .ilike('name', `%${q}%`)
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

// Section 12: Get Search Suggestions
// GET /api/v1/products/suggestions?q=...
// Returns autocomplete suggestions based on product names matching the query. Used for search-as-you-type functionality.
// Flow:
//   1. If query is empty, return empty array immediately
//   2. Search product names matching the query
//   3. Deduplicate using Set (in case of identical names)
//   4. Return up to 10 unique suggestions
// FIX APPLIED: Changed column from 'name' to 'product_name' to match the actual database schema.

exports.getSearchSuggestions = asyncHandler(async (req, res) => {
  try {
    const query = req.query.q || '';

    // Return empty results for blank queries to save a DB call
    if (!query.trim()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const { data, error } = await supabase
      .from('products')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) throw error;

    // Deduplicate product names using Set
    const suggestions = [
      ...new Set(data.map((item) => item.name)),
    ];

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 13: Get Search History
// GET /api/v1/products/search-history
// Returns the last 10 search queries made by the authenticated user.
// Used to show Recent Searches in the client's search UI.
// Why limit 10: Keeps the history manageable and matches common UX patterns for recent search lists.

exports.getSearchHistory = asyncHandler(async (req, res) => {
  try {

    
    const { data, error } = await supabase
      .from('search_history')
      .select('keyword, searched_at')
      .eq('user_id', req.user.id)
      .order('searched_at', {
        ascending: false,
      })
      .limit(10);

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
});

// Section 14: Get Trending Searches
// GET /api/v1/products/trending-searches
// Aggregates all search queries across all users and returns the top 10 most frequently searched keywords.
// Flow:
//   1. Fetch all search history records
//   2. Count keyword frequency (case-insensitive)
//   3. Sort by count descending
//   4. Return top 10
// Why client-side aggregation: Supabase doesn't natively support GROUP BY with COUNT in the JS client, so aggregation is done in-memory. For large datasets, this should be moved to an RPC.

exports.getTrendingSearches = asyncHandler(async (req, res) => {
  try {
    
    const { data, error } = await supabase
      .from('search_history')
      .select('keyword');

    if (error) throw error;

    // Build a frequency map of search keywords (case-insensitive)
    const keywordMap = {};

    data.forEach((item) => {
      const keyword = item.keyword.toLowerCase();

      keywordMap[keyword] =
        (keywordMap[keyword] || 0) + 1;
    });

    // Convert map to sorted array and take top 10
    const trending = Object.entries(keywordMap)
      .map(([keyword, count]) => ({
        keyword,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: trending.length,
      data: trending,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 15: Get Product By ID
// GET /api/v1/products/:id
// Fetches a single product with full details and shop info.
// Also performs several side effects to support recommendations:
//   1. Increments the product's view counter
//   2. Recalculates the recommendation score
//   3. Records the view in recently_viewed (if user is authenticated)
//   4. Updates the user's interest score for this product's category
// Why so many side effects: Every product view is a signal that feeds the recommendation engine. 
// Incrementing views and updating scores on each view ensures the trending/recommendation data stays current in real-time.

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product details first so we have the category for interest tracking
    const { data, error } = await products.getProductById(id);

    if (error) throw error;

    // Track the view after successful fetch — pass category for interest score update
    if (req.user) {
      await recommendation.trackProductView(id, req.user.id, data?.category || null);
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Section 16: Update Product Image
// PATCH /api/v1/products/:id/image
// Updates the image URL for a specific product.
// Protected by auth, role authorization, and ownership check middleware.
// Why PATCH: Only updates the image_url field, not the entire product record. PATCH is semantically correct for partial updates.

exports.updateProductImage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    // Use products service to update product
    const { data, error } = await products.updateProduct(id, { image_url });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Product image updated successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});