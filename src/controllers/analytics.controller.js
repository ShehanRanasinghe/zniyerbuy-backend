const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
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

exports.getSellerStats = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;

    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    const shopIds = shops.map((shop) => shop.id);

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

exports.getTopProducts = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;

    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    const shopIds = shops.map((shop) => shop.id);

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

exports.getTopCategories = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    if (error) throw error;

    const categoryMap = {};

    data.forEach((product) => {
      const category = product.category || 'Unknown';

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    });

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

exports.getUserActivityStats = asyncHandler(async (req, res) => {
  try {
    const [
      recentViews,
      recentSearches,
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
        totalSearches: recentSearches.count || 0,
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