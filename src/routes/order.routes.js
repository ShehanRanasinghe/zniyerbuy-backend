// Order Routes — Defines endpoints for order retrieval
// Supports retrieving all orders (filtered by seller's shop) and single order details

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getOrders, getOrder } = require('../controllers/order.controller');

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
router.get('/:id', protect, getOrder);

module.exports = router;
