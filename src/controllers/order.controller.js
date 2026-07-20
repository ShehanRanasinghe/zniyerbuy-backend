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

// PATCH /api/v1/orders/:id
// Updates an order's status, delivery fee, payment method, and/or invoice_sent flag.
// Ownership is verified by the checkOrderOwnership middleware before this runs.
exports.updateOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, delivery_fee, payment_method, invoice_sent } = req.body;

    const updateFields = { updated_at: new Date() };
    if (status !== undefined) updateFields.status = status;
    if (payment_method !== undefined) updateFields.payment_method = payment_method;
    if (invoice_sent !== undefined) updateFields.invoice_sent = invoice_sent;

    if (delivery_fee !== undefined) {
      updateFields.delivery_fee = delivery_fee;

      // Recalculate total_amount from subtotal + new delivery fee whenever
      // we know the subtotal, so the two stay consistent instead of
      // drifting apart.
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('subtotal')
        .eq('id', id)
        .single();

      if (!fetchError && existingOrder?.subtotal != null) {
        updateFields.total_amount = Number(existingOrder.subtotal) + Number(delivery_fee);
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data,
    });
  } catch (err) {
    console.error('[updateOrder] Failed to update order:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
    res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
  }
});