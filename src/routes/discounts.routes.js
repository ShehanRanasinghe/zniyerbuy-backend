// Deal/Promotion Routes

// Defines HTTP routes for deal operations: listing all deals (public) and creating new deals (authenticated).
// Why: Deals are promotional discounts that shops offer.
// GET is public so anyone can browse deals; POST requires auth to ensure only authenticated shop owners create promotions.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const checkDiscountOwnership = require('../middleware/checkDiscountOwnership');

// Section 2: Controller & Validator Imports
const {
  createDiscountValidator,
  updateDiscountValidator,
} = require('../validators/discounts.validator');

const {
  createDiscount,
  getDiscounts,
} = require('../controllers/discounts.controller');

// Section 3: Route Definitions
// GET / - List all discounts (public)
//   No middleware needed. Anyone can browse available discounts.
// POST / - Create a new discount (authenticated)
//   Middleware chain: protect -> createDiscountValidator -> validate -> createDiscount
//   Why: User must be logged in, input must be validated before creation.
/**
 * @swagger
 * /deals:
 *   get:
 *     summary: Get all active deals
 *     tags: [Deals]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         schema:
 *           type: string
 *         description: Filter deals by shop
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of deals
 *   post:
 *     summary: Create a new deal
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - discount_percentage
 *               - shop_id
 *               - start_date
 *               - end_date
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               discount_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               shop_id:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Deal created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', getDiscounts);

/**
 * @swagger
 * /deals/{dealId}:
 *   get:
 *     summary: Get a deal by ID
 *     tags: [Deals]
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal data
 *       404:
 *         description: Deal not found
 *   patch:
 *     summary: Update a deal
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               discount_percentage:
 *                 type: number
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Deal updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deal not found
 *   delete:
 *     summary: Delete a deal
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deal not found
 */
router.get('/:dealId', optionalAuth, require('../controllers/discounts.controller').getDiscount);
router.patch('/:dealId', protect, checkDiscountOwnership, updateDiscountValidator, validate, require('../controllers/discounts.controller').updateDiscount);
router.delete('/:dealId', protect, checkDiscountOwnership, require('../controllers/discounts.controller').deleteDiscount);

router.post(
  '/',
  protect,
  createDiscountValidator,
  validate,
  createDiscount
);

module.exports = router;