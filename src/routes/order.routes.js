// Order Routes — Defines endpoints for order retrieval
// Supports retrieving all orders (filtered by seller's shop) and single order details

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const checkOrderOwnership = require('../middleware/checkOrderOwnership');
const { updateOrderValidator, createOrderValidator } = require('../validators/order.validator');
const { getOrders, getOrder, updateOrder, createOrder, getMyOrders, cancelMyOrder } = require('../controllers/order.controller');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order as the authenticated customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Validation error, out of stock, or mixed-shop items
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: One or more products not found
 */
router.post('/', protect, createOrderValidator, validate, createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the seller's shop
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getOrders);

/**
 * @swagger
 * /orders/mine:
 *   get:
 *     summary: Get the authenticated customer's own orders (with shop info and line items)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Optional status filter
 *     responses:
 *       200:
 *         description: List of the customer's own orders
 *       401:
 *         description: Unauthorized
 */
router.get('/mine', protect, getMyOrders);

/**
 * @swagger
 * /orders/mine/{id}/cancel:
 *   patch:
 *     summary: Cancel one of the authenticated customer's own orders (pending only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Order is no longer pending
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the customer who placed this order
 *       404:
 *         description: Order not found
 */
router.patch('/mine/:id/cancel', protect, cancelMyOrder);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', protect, checkOrderOwnership, getOrder);

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update an order's status, delivery fee, payment method, or invoice_sent flag
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the order's shop owner
 *       404:
 *         description: Order not found
 */
router.patch('/:id', protect, checkOrderOwnership, updateOrderValidator, validate, updateOrder);

module.exports = router;