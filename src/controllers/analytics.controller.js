// Analytics & Dashboard Controller

// Provides analytics endpoints for admin dashboards, seller dashboards, and platform-wide statistics. 
// Aggregates data from products, shops, deals, users, and user activity tables.
// Why: Gives admins visibility into platform health (total users, products, shops) and gives sellers insights into their product performance (views, favorites, ratings, recommendation scores).

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Get Dashboard Stats (Admin Only)
// GET /api/v1/analytics/dashboard
// Returns total counts for products, shops, deals, and users.
// Uses Promise.all to run all four count queries in parallel.
// Why head: true with count: 'exact': The 'head' option tells Supabase to only return the count without fetching any row data, making this extremely efficient for large tables.

exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Run all count queries in parallel for better performance
    const [
      productsResult,
      shopsResult,
      dealsResult,
      usersResult,
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('shops').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts: productsResult.count || 0,
        totalShops: shopsResult.count || 0,
        totalDeals: dealsResult.count || 0,
        totalUsers: usersResult.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get Seller Stats
// GET /api/v1/analytics/seller
// Returns statistics for the authenticated seller's shops including total products, deals, and reviews across all their shops.
// Flow:
//   1. Get all shop IDs owned by the current user
//   2. Count products, deals, and reviews linked to those shops
//   3. Return aggregated counts
// Why query shops first: Need the shop IDs to filter products, deals, and reviews that belong to this specific seller.

exports.getSellerStats = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch all shops owned by this seller
    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    const shopIds = shops.map((shop) => shop.id);

    // Count products, deals, and reviews for all seller's shops in parallel
    const [
      productsResult,
      dealsResult,
      reviewsResult,
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .in('shop_id', shopIds),

      supabase
        .from('deals')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .in('shop_id', shopIds),

      supabase
        .from('reviews')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .in('shop_id', shopIds),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalShops: shopIds.length,
        totalProducts: productsResult.count || 0,
        totalDeals: dealsResult.count || 0,
        totalReviews: reviewsResult.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 4: Get Top Products (Seller)
// GET /api/v1/analytics/seller/top-products
// Returns the top 10 best-performing products across the seller's shops, ranked by recommendation_score.
// Why recommendation_score: It's a composite score that factors in views, favorites, and ratings, making it the best single metric for product performance ranking.

exports.getTopProducts = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch all shops owned by this seller
    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    const shopIds = shops.map((shop) => shop.id);

    // Get top 10 products by recommendation score across all seller's shops
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        views,
        favorites_count,
        average_rating,
        recommendation_score,
        shop_id
      `)
      .in('shop_id', shopIds)
      .order('recommendation_score', {
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

// Section 5: Get Top Categories (Admin Only)
// GET /api/v1/analytics/top-categories
// Returns all product categories ranked by the number of products in each category. 
// Useful for understanding marketplace composition.
// Flow:
//   1. Fetch all products' category field
//   2. Count products per category using a frequency map
//   3. Sort by count descending
// Why client-side aggregation: Supabase JS client doesn't support GROUP BY natively. 
// For large datasets, consider creating a database view or RPC function for this aggregation.

exports.getTopCategories = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    if (error) throw error;

    // Build frequency map of categories
    const categoryMap = {};

    data.forEach((product) => {
      const category = product.category || 'Unknown';

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    });

    // Convert map to sorted array
    const result = Object.entries(categoryMap)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 6: Get User Activity Stats (Admin Only)
// GET /api/v1/analytics/user-activity
// Returns platform-wide user activity counts: total product views, total searches, and total favorites across ALL users.
// Why platform-wide (no user filter): This is an admin endpoint meant to show overall platform engagement, not individual user stats.

exports.getUserActivityStats = asyncHandler(async (req, res) => {
  try {
    // Count all records in activity tables in parallel
    const [
      recentViews,
      searchHistory,
      recentFavorites,
    ] = await Promise.all([
      supabase
        .from('recently_viewed')
        .select('*', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('search_history')
        .select('*', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('favorites')
        .select('*', {
          count: 'exact',
          head: true,
        }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalViews: recentViews.count || 0,
        totalSearches: searchHistory.count || 0,
        totalFavorites: recentFavorites.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 7: Get Popular Shops (Admin Only)
// GET /api/v1/analytics/popular-shops
// Returns all shops ranked by a computed popularity score based on their products' combined views, favorites, and recommendation scores.
// Flow:
//   1. Fetch all shops with their products' engagement metrics
//   2. For each shop, sum up views, favorites, and recommendation scores
//   3. Sort shops by total recommendation score (descending)
// Why aggregate product metrics per shop: Individual product metrics are combined to produce a shop-level popularity ranking, giving admins insight into which shops are driving the most engagement.

exports.getPopularShops = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        products (
          views,
          favorites_count,
          recommendation_score
        )
      `);

    if (error) throw error;

    // Calculate aggregate analytics for each shop
    const rankedShops = data.map((shop) => {
      const products = shop.products || [];

      const totalViews = products.reduce(
        (sum, p) => sum + (p.views || 0),
        0
      );

      const totalFavorites = products.reduce(
        (sum, p) => sum + (p.favorites_count || 0),
        0
      );

      const totalScore = products.reduce(
        (sum, p) => sum + (p.recommendation_score || 0),
        0
      );

      return {
        ...shop,
        analytics: {
          totalViews,
          totalFavorites,
          totalScore,
        },
      };
    });

    // Sort shops by total recommendation score, highest first
    rankedShops.sort(
      (a, b) =>
        b.analytics.totalScore -
        a.analytics.totalScore
    );

    res.status(200).json({
      success: true,
      count: rankedShops.length,
      data: rankedShops,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 8: Get Seller Performance
// GET /api/v1/analytics/seller/performance
// Returns aggregated performance metrics for the authenticated seller across all their products: total views, total favorites, average rating, and total recommendation score.
// Why avgRating uses toFixed(2): Limits the a verage to 2 decimal places for clean display (e.g., 4.25 instead of 4.2500000001).

exports.getSellerPerformance = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch all shops owned by this seller
    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    const shopIds = shops.map((shop) => shop.id);

    // Fetch engagement metrics for all products across seller's shops
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        views,
        favorites_count,
        average_rating,
        recommendation_score
      `)
      .in('shop_id', shopIds);

    if (error) throw error;

    // Aggregate metrics across all products
    const totalViews = products.reduce(
      (sum, p) => sum + (p.views || 0),
      0
    );

    const totalFavorites = products.reduce(
      (sum, p) => sum + (p.favorites_count || 0),
      0
    );

    // Calculate average rating across all products (0 if no products)
    const avgRating =
      products.length > 0
        ? (
            products.reduce(
              (sum, p) => sum + (p.average_rating || 0),
              0
            ) / products.length
          ).toFixed(2)
        : 0;

    const totalRecommendationScore =
      products.reduce(
        (sum, p) => sum + (p.recommendation_score || 0),
        0
      );

    res.status(200).json({
      success: true,
      stats: {
        totalViews,
        totalFavorites,
        averageRating: Number(avgRating),
        totalRecommendationScore,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});