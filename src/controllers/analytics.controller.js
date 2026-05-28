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