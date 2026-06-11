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
      role: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      status: user.is_active ? 'Active' : 'Inactive',
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
      role: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
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
      Seller: 'seller',
      User: 'user',
    };

    const { data, error } = await supabase
      .from('users')
      .update({ role: roleMap[role] || 'user' })
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

// Section 5: Delete User (Admin)
// DELETE /api/v1/admin/users/:id
// Soft deletes a user by marking as inactive
exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
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

// Section 6: Get All Shops (Admin)
// GET /api/v1/admin/shops
// Returns all shops for admin management and verification
exports.getAllShops = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('id, name, owner_id, category, status, created_at, users(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedShops = data.map((shop, index) => ({
      id: shop.id,
      name: shop.name || `Shop ${index + 1}`,
      owner: shop.users?.full_name || `Owner ${index + 1}`,
      category: shop.category || 'General',
      status: shop.status === 'approved' ? 'Verified' : shop.status === 'rejected' ? 'Rejected' : 'Pending',
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

// Section 7: Update Shop Status (Admin)
// PATCH /api/v1/admin/shops/:id/verify
// Verifies or rejects a shop
exports.updateShopStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('shops')
      .update({ status })
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

// Section 8: Delete Shop (Admin)
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

// Section 9: Get All Products (Admin)
// GET /api/v1/admin/products
// Returns all products for admin monitoring
exports.getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, shop_id, category, price, is_flagged, has_active_deal, shops(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedProducts = data.map((product, index) => ({
      id: product.id,
      name: product.name || `Product ${index + 1}`,
      shop: product.shops?.name || `Shop ${index + 1}`,
      category: product.category || 'General',
      price: `LKR ${product.price?.toLocaleString() || '0'}`,
      status: product.is_flagged ? 'Flagged' : product.has_active_deal ? 'Deal' : 'Active',
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

// Section 10: Flag Product (Admin)
// PATCH /api/v1/admin/products/:id/flag
// Flags or unflags a product
exports.flagProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { is_flagged } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ is_flagged })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Product ${is_flagged ? 'flagged' : 'unflagged'} successfully`,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 11: Delete Product (Admin)
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

// Section 12: Get Dashboard Stats (Admin)
// GET /api/v1/admin/stats
// Returns aggregated statistics for the analytics dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Count users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Count shops
    const { count: shopCount } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true });

    // Count products
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Count active deals
    const { data: dealsData } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount || 0,
        totalShops: shopCount || 0,
        totalProducts: productCount || 0,
        activeDeals: dealsData?.length || 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

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
