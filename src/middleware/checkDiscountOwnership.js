// Discount (Promotion/Deal) Ownership Verification Middleware
//
// Verifies that the authenticated user owns the shop that the discount
// belongs to, OR is an admin. Used on routes that update/delete discounts,
// to prevent one shop owner from modifying another shop's promotions/deals.
// Mirrors checkShopOwnership.js / checkOrderOwnership.js.

const supabase = require('../config/supabase');

const checkDiscountOwnership = async (req, res, next) => {
  try {
    const { dealId, discountId, id } = req.params;
    const discountIdentifier = dealId || discountId || id;

    const { data: discount, error } = await supabase
      .from('discounts')
      .select('shop_id, shops!shop_id(owner_id)')
      .eq('id', discountIdentifier)
      .single();

    if (error || !discount) {
      return res.status(404).json({
        success: false,
        error: 'Discount not found',
      });
    }

    const isOwner = discount.shops?.owner_id === req.user.id;

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized discount access',
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

module.exports = checkDiscountOwnership;