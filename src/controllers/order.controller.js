// Order Controller — Handles retrieving orders for the seller and placing
// new orders as a customer.
// getOrders/getOrder/updateOrder stub the orders retrieval from Supabase.
// If the table doesn't exist, they fall back to a clean empty array
// instead of throwing errors.

const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { v4: uuidv4 } = require('uuid');

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

// POST /api/v1/orders
// Places a new order as the authenticated customer.
// Flow:
//   1. Load every referenced product and confirm they all belong to the
//      same shop (an order is always for one shop at a time).
//   2. Check availability/stock for each item.
//   3. Look up any currently-active deal for each product so the order
//      captures the deal price rather than the regular price.
//   4. Insert the order row, then insert one order_items row per product.
//   5. Best-effort decrement stock_quantity for each product purchased.
// Why this didn't exist before: the backend only ever had endpoints for a
// shop owner to view/update their orders (see order.routes.js) — there was
// no way for a customer to actually place one.
exports.createOrder = asyncHandler(async (req, res) => {
  try {
    const {
      items,
      delivery_type = 'delivery',
      payment_method = 'cod',
      delivery_address,
      customer_phone,
    } = req.body;

    const productIds = [...new Set(items.map((item) => item.product_id))];

    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, shop_id, is_available, stock_quantity')
      .in('id', productIds);

    if (productsError) throw productsError;

    if (!dbProducts || dbProducts.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        error: 'One or more products in this order could not be found',
      });
    }

    // An order is always placed against a single shop. If the cart ever
    // mixes products from different shops, reject rather than silently
    // picking one — the customer needs to split it into separate orders.
    const shopIds = [...new Set(dbProducts.map((p) => p.shop_id))];
    if (shopIds.length > 1) {
      return res.status(400).json({
        success: false,
        error: 'All items in one order must be from the same shop. Please place separate orders for different shops.',
      });
    }
    const shop_id = shopIds[0];

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.product_id);
      if (!product.is_available) {
        return res.status(400).json({
          success: false,
          error: `"${product.name}" is currently out of stock`,
        });
      }
      if (product.stock_quantity != null && product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Only ${product.stock_quantity} of "${product.name}" left in stock`,
        });
      }
    }

    // Pull any active deal per product so the order is priced correctly.
    const now = new Date().toISOString();
    const { data: activeDeals } = await supabase
      .from('discounts')
      .select('id, product_id, deal_price, discounted_price')
      .in('product_id', productIds)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);

    const dealByProduct = {};
    (activeDeals || []).forEach((deal) => {
      if (deal.product_id) dealByProduct[deal.product_id] = deal;
    });

    const orderItemsPayload = items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.product_id);
      const deal = dealByProduct[item.product_id];
      const dealPriceRaw = deal ? (deal.deal_price ?? deal.discounted_price) : null;
      const dealPrice = dealPriceRaw != null ? Number(dealPriceRaw) : null;
      const unitPrice = dealPrice != null && !Number.isNaN(dealPrice) ? dealPrice : Number(product.price);

      return {
        product_id: product.id,
        discount_id: deal ? deal.id : null,
        product_name: product.name,
        unit_price: unitPrice,
        original_price: Number(product.price),
        quantity: item.quantity,
        line_total: Number((unitPrice * item.quantity).toFixed(2)),
      };
    });

    const subtotal = Number(
      orderItemsPayload.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)
    );
    // No delivery-fee pricing model exists yet — the shop owner can set
    // one afterwards via the existing PATCH /orders/:id endpoint, which
    // already recalculates total_amount when delivery_fee changes.
    const delivery_fee = 0;
    const total_amount = Number((subtotal + delivery_fee).toFixed(2));
    const items_count = items.reduce((sum, item) => sum + item.quantity, 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          id: uuidv4(),
          shop_id,
          customer_id: req.user.id,
          customer_name: req.user.full_name,
          customer_phone: customer_phone || null,
          delivery_address: delivery_type === 'pickup' ? null : delivery_address,
          delivery_type,
          payment_method,
          order_number: generateOrderNumber(),
          subtotal,
          delivery_fee,
          total_amount,
          items_count,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload.map((item) => ({ ...item, order_id: order.id })))
      .select();

    if (itemsError) {
      // The order row was already created at this point. Surfacing the
      // real error here (rather than a generic 500) makes this case easy
      // to spot in server logs instead of leaving a silently item-less order.
      console.error('[createOrder] Order created but order_items failed to insert:', itemsError.message);
      throw itemsError;
    }

    // Best-effort stock decrement — not fatal if it fails, since the order
    // itself already succeeded.
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.product_id);
      if (product.stock_quantity != null) {
        try {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
            .eq('id', product.id);
        } catch (stockErr) {
          console.error(`[createOrder] Stock decrement failed for product ${product.id}:`, stockErr.message);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { ...order, items: insertedItems },
    });
  } catch (err) {
    console.error('[createOrder] Failed to create order:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/v1/orders/mine
// Returns the authenticated customer's own orders — each with its shop
// info and full per-product line-item breakdown — optionally filtered by
// status. Backs the customer-facing Orders page (status tabs, per-item
// name/quantity/price, deal labels).
// Why this didn't exist before: getOrders only ever returned orders for
// the *seller's* shop (filtered by shops.owner_id via checkOrderOwnership)
// — there was no endpoint for a customer to see their own order history.
exports.getMyOrders = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        shops (
          id,
          name,
          logo_url,
          address,
          city,
          phone
        ),
        order_items (
          id,
          product_id,
          discount_id,
          product_name,
          unit_price,
          original_price,
          quantity,
          line_total
        )
      `)
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// PATCH /api/v1/orders/mine/:id/cancel
// Lets the customer who placed an order cancel it themselves — but only
// while it's still 'pending'. Once a shop has moved it to processing/
// shipped/delivered, the customer can no longer self-cancel.
exports.cancelMyOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, customer_id, status')
      .eq('id', id)
      .single();

    if (findError || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order',
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Only pending orders can be cancelled (this order is ${order.status})`,
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Order cancelled',
      data,
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