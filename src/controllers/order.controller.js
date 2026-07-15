// Order Controller — Handles retrieving orders for the seller
// Stubs the orders retrieval from Supabase. If the table doesn't exist,
// it falls back to a clean empty array instead of throwing errors.

const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/v1/orders
// Retrieves all orders for the authenticated shop owner.
exports.getOrders = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch the shop(s) owned by this user first
    const { data: shops, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    if (shopError) throw shopError;

    if (!shops || shops.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const shopIds = shops.map(shop => shop.id);

    // Try fetching from 'orders' table in Supabase
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false });

    // If the orders table doesn't exist or there is another DB error, 
    // fall back to an empty array to prevent dashboard crashes.
    if (error) {
      console.warn('Supabase orders table warning:', error.message);
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: data ? data.length : 0,
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/v1/orders/:id
// Retrieves a single order by ID
exports.getOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Supabase order details warning:', error.message);
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
