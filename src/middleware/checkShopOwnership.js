// Shop Ownership Verification Middleware

// Verifies that the authenticated user is the owner of the shop being modified, OR is an admin. 
// Used on routes that update or delete shops to prevent unauthorized modifications.
// Why: Similar to checkProductOwnership, but for shop resources.
// Ensures shop owners can only modify their own shops.

// Section 1: Dependencies
const supabase = require('../config/supabase');

// Section 2: Ownership Check Logic
// Flow:
//   1. Extract the shop ID from route params
//   2. Look up the shop and its owner_id
//   3. If shop doesn't exist, return 404
//   4. If the current user is NOT the owner AND NOT an admin, return 403 Forbidden
//   5. Otherwise, call next() to proceed
const checkShopOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('shops')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found',
      });
    }

    // Allow access if user is the owner or has admin role
    if (
      data.owner_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized shop access',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = checkShopOwnership;