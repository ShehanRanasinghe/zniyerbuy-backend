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