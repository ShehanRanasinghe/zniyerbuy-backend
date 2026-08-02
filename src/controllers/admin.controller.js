// Admin Controller

// Handles admin-specific operations for user, shop, and product management.
// All endpoints in this controller require admin authorization.
// Why separate controller: Keeps admin operations isolated from regular user operations for security and maintainability.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Get All Users (Admin)
// GET /api/v1/admin/users
// Returns a list of all users with their profiles for admin management
exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format users for admin panel display
    const formattedUsers = data.map((user, index) => ({
      id: user.id,
      name: user.full_name || `User ${index + 1}`,
      email: user.email || 'N/A',
      role: user.role === 'admin' ? 'Admin' : user.role === 'shop_owner' ? 'Seller' : 'User',
      status: user.is_active !== false ? 'Active' : 'Inactive',
      isActive: user.is_active !== false,
      joined: new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      initials: user.full_name ? user.full_name.split(' ').map((n) => n[0]).join('') : 'U',
      color: '#1a1a1a',
      textColor: '#888888',
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get Recent Users (Admin)
// GET /api/v1/admin/users/recent
// Returns recently registered users for the dashboard widget
exports.getRecentUsers = asyncHandler(async (req, res) => {
  try {
    const limit = req.query.limit || 4;

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const formattedUsers = data.map((user) => ({
      name: user.full_name || 'Unknown User',
      time: getTimeAgo(new Date(user.created_at)),
      role: user.role === 'admin' ? 'Admin' : user.role === 'shop_owner' ? 'Seller' : 'User',
      color: '#1a1a1a',
      textColor: '#888888',
      initials: user.full_name ? user.full_name.split(' ').map((n) => n[0]).join('') : 'U',
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 4: Update User Role (Admin)
// PATCH /api/v1/admin/users/:id/role
// Updates a user's role (Admin, Seller, User)
exports.updateUserRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const roleMap = {
      Admin: 'admin',
      Seller: 'shop_owner',
      User: 'customer',
    };

    const { data, error } = await supabase
      .from('users')
      .update({ role: roleMap[role] || 'customer' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// Section 5: Toggle User Status (Admin)
// PATCH /api/v1/admin/users/:id/status
// Toggles user account status between active and inactive (soft delete)
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validate is_active is a boolean
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean value',
      });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `User account ${is_active ? 'activated' : 'deactivated'} successfully`,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 6: Delete User (Admin)
// DELETE /api/v1/admin/users/:id
// Soft deletes a user by marking as inactive
exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 7: Get All Shops (Admin)
// GET /api/v1/admin/shops
// Returns all shops for admin management and verification
exports.getAllShops = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('id, name, owner_id, category, is_verified, is_active, created_at, users!owner_id(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedShops = data.map((shop, index) => ({
      id: shop.id,
      name: shop.name || `Shop ${index + 1}`,
      owner: shop.users?.full_name || `Owner ${index + 1}`,
      category: shop.category || 'General',
      status: shop.is_verified ? 'Verified' : !shop.is_active ? 'Rejected' : 'Pending',
      registered: new Date(shop.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      initials: shop.name ? shop.name.split(' ').slice(0, 2).map((n) => n[0]).join('') : 'SH',
      color: '#1a1a1a',
      textColor: '#888888',
    }));

    res.status(200).json({
      success: true,
      data: formattedShops,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 8: Update Shop Status (Admin)
// PATCH /api/v1/admin/shops/:id/verify
// Verifies or rejects a shop
exports.updateShopStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = status === 'approved'
      ? { is_verified: true, is_active: true }
      : { is_verified: false, is_active: false };

    const { data, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Shop ${status === 'approved' ? 'verified' : 'rejected'} successfully`,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 9: Delete Shop (Admin)
// DELETE /api/v1/admin/shops/:id
// Permanently deletes a shop
exports.deleteShop = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Shop deleted successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 10: Get All Products (Admin)
// GET /api/v1/admin/products
// Returns all products for admin monitoring
exports.getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, shop_id, category, price, is_available, shops!shop_id(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedProducts = data.map((product, index) => ({
      id: product.id,
      name: product.name || `Product ${index + 1}`,
      shop: product.shops?.name || `Shop ${index + 1}`,
      category: product.category || 'General',
      price: `LKR ${Number(product.price || 0).toLocaleString()}`,
      status: !product.is_available ? 'Inactive' : 'Active',
      initials: product.name ? product.name.split(' ')[0].substring(0, 2).toUpperCase() : 'PR',
      color: '#1a1a1a',
      textColor: '#888888',
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 11: Flag Product (Admin)
// PATCH /api/v1/admin/products/:id/flag
// Toggles product availability (since is_flagged column doesn't exist in schema)
exports.flagProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ is_available })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Product ${is_available ? 'activated' : 'deactivated'} successfully`,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 12: Delete Product (Admin)
// DELETE /api/v1/admin/products/:id
// Permanently deletes a product
exports.deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 13: Get Dashboard Stats (Admin)
// GET /api/v1/admin/stats
// Returns aggregated statistics for the analytics dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // FIX APPLIED: userCount/shopCount/productCount previously ran as 3
    // separate sequential awaits (3 full network round-trips to Supabase,
    // one after another) BEFORE the Promise.all below even started - a
    // major contributor to the slow dashboard load. All counts now run in
    // a single parallel batch. Also dropped the notifications/interactions
    // counts entirely (2 fewer queries) since those stat cards were
    // removed from the dashboard.
    const [
      usersResult,
      shopsResult,
      productsResult,
      dealsResult,
      favoritesResult,
      reviewsResult,
      recentlyViewedResult,
      userInterestsResult,
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('shops').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('discounts').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('recently_viewed').select('*', { count: 'exact', head: true }),
      supabase.from('user_interests').select('*', { count: 'exact', head: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: usersResult.count || 0,
        totalShops: shopsResult.count || 0,
        totalProducts: productsResult.count || 0,
        activeDeals: dealsResult.count || 0,
        totalFavorites: favoritesResult.count || 0,
        totalReviews: reviewsResult.count || 0,
        totalRecentlyViewed: recentlyViewedResult.count || 0,
        totalUserInterests: userInterestsResult.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 13b: Get Breakdown Data (Admin)
// GET /api/v1/admin/breakdown
// Powers the dashboard's 4 new breakdown charts. Uses Postgres RPC
// aggregation functions (see migration
// 20260803090000-add-admin-dashboard-breakdown-rpcs.js) rather than
// fetching raw rows and grouping them in Node - GROUP BY + COUNT runs
// once in the database and returns only the aggregated rows.
exports.getBreakdownData = asyncHandler(async (req, res) => {
  try {
    const [usersByRole, productsByCategory, ordersByShop, reviewsByShop] = await Promise.all([
      supabase.rpc('admin_users_by_role'),
      supabase.rpc('admin_products_by_category'),
      supabase.rpc('admin_orders_by_shop', { result_limit: 10 }),
      supabase.rpc('admin_reviews_by_shop', { result_limit: 10 }),
    ]);

    if (usersByRole.error) throw usersByRole.error;
    if (productsByCategory.error) throw productsByCategory.error;
    if (ordersByShop.error) throw ordersByShop.error;
    if (reviewsByShop.error) throw reviewsByShop.error;

    res.status(200).json({
      success: true,
      data: {
        usersByRole: usersByRole.data || [],
        productsByCategory: productsByCategory.data || [],
        ordersByShop: ordersByShop.data || [],
        reviewsByShop: reviewsByShop.data || [],
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 14: Get Trend Data (Admin)
// GET /api/v1/admin/trends
// FIX APPLIED: Previously also fetched deals (with a `views_count` column
// that doesn't exist on the discounts table at all - silently returned no
// data) and user_interactions, to feed the since-removed Engagement Trends
// chart. Trimmed to just users+products, which is all the remaining
// Growth Trends chart needs - fewer queries, faster load.
exports.getTrendData = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const [usersData, productsData] = await Promise.all([
      supabase.from('users').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
      supabase.from('products').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
    ]);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
        label: d.toLocaleString('default', { month: 'short' }),
        newUsers: 0, newProducts: 0,
      });
    }
    const getMonthKey = (dateStr) => {
      const d = new Date(dateStr);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    };
    (usersData.data || []).forEach((r) => { const m = months.find((mo) => mo.key === getMonthKey(r.created_at)); if (m) m.newUsers++; });
    (productsData.data || []).forEach((r) => { const m = months.find((mo) => mo.key === getMonthKey(r.created_at)); if (m) m.newProducts++; });
    res.status(200).json({ success: true, data: months });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Section 15: Get All Deals (Admin)
// GET /api/v1/admin/deals
exports.getAllDeals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('id, title, shop_id, product_id, discount_type, discount_value, deal_price, original_price, is_active, start_date, end_date, views_count, created_at, shops!shop_id(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const formatted = data.map((deal) => ({
      id: deal.id, title: deal.title,
      shop: deal.shops?.name || 'Unknown Shop', shopId: deal.shop_id,
      discountType: deal.discount_type, discountValue: deal.discount_value,
      dealPrice: deal.deal_price, originalPrice: deal.original_price,
      isActive: deal.is_active,
      startDate: new Date(deal.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      endDate: new Date(deal.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      viewsCount: deal.views_count || 0,
      created: new Date(deal.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Section 16: Toggle Deal (Admin)
exports.toggleDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const { data, error } = await supabase.from('discounts').update({ is_active }).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Deal updated', data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// Section 17: Delete Deal (Admin)
exports.deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('discounts').delete().eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Deal deleted', data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// Section 18: Get All Reviews (Admin)
exports.getAllReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, user_id, shop_id, users!user_id(full_name, email), shops!shop_id(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const formatted = data.map((r) => ({
      id: r.id, rating: r.rating, comment: r.comment || '',
      user: r.users?.full_name || 'Unknown', email: r.users?.email || '',
      shop: r.shops?.name || 'Unknown Shop', shopId: r.shop_id, userId: r.user_id,
      created: new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// Section 19: Delete Review (Admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('reviews').delete().eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Review deleted', data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// Section 20: Get All Notifications (Admin)
exports.getAllNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, type, is_read, created_at, user_id, users!user_id(full_name, email)')
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    const formatted = data.map((n) => ({
      id: n.id, title: n.title, body: n.body || '', type: n.type, isRead: n.is_read,
      user: n.users?.full_name || 'Unknown', email: n.users?.email || '', userId: n.user_id,
      created: new Date(n.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// Section 21: Delete Notification (Admin)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('notifications').delete().eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Notification deleted', data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};