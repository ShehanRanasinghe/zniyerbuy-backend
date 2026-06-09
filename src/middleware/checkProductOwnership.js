// Product Ownership Verification Middleware

// Verifies that the authenticated user is the owner of the product being modified, OR is an admin. 
// Used on routes that update or delete products to prevent unauthorized modifications.
// Why: Even if a user is authenticated, they should only be able to modify their own products. 
// This middleware adds an ownership check layer on top of basic authentication.

// Section 1: Dependencies
const supabase = require('../config/supabase');

// Section 2: Ownership Check Logic
// Flow:
//   1. Extract the product ID from route params
//   2. Look up the product and its owner_id
//   3. If product doesn't exist, return 404
//   4. If the current user is NOT the owner AND NOT an admin, return 403 Forbidden
//   5. Otherwise, call next() to proceed
// Why select only 'id, owner_id': Minimizes data transfer since we only need to verify ownership, not read the full product.
const checkProductOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Allow access if user is the owner or has admin role
    if (
      data.owner_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized product access',
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

module.exports = checkProductOwnership;