// Order Routes — Defines endpoints for order retrieval
// Supports retrieving all orders (filtered by seller's shop) and single order details

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const checkOrderOwnership = require('../middleware/checkOrderOwnership');
const { updateOrderValidator } = require('../validators/order.validator');
const { getOrders, getOrder, updateOrder } = require('../controllers/order.controller');

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