// Order Ownership Verification Middleware
//
// Verifies that the authenticated user owns the shop that the order
// belongs to, OR is an admin. Used on routes that update orders, to
// prevent one shop owner from modifying another shop's orders.
// Mirrors checkShopOwnership.js / checkProductOwnership.js.

const supabase = require('../config/supabase');

const checkOrderOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('shop_id, shops!shop_id(owner_id)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const isOwner = order.shops?.owner_id === req.user.id;

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized order access',
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

module.exports = checkOrderOwnership;