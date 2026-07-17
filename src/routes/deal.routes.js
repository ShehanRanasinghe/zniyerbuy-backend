// Deal/Promotion Routes

// Defines HTTP routes for deal operations: listing all deals (public) and creating new deals (authenticated).
// Why: Deals are promotional discounts that shops offer.
// GET is public so anyone can browse deals; POST requires auth to ensure only authenticated shop owners create promotions.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Section 2: Controller & Validator Imports
const {
  createDealValidator,
} = require('../validators/deal.validator');

const {
  createDeal,
  getDeals,
} = require('../controllers/deal.controller');

// Section 3: Route Definitions
// GET / - List all deals (public)
//   No middleware needed. Anyone can browse available deals.
// POST / - Create a new deal (authenticated)
//   Middleware chain: protect -> createDealValidator -> validate -> createDeal
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
router.get('/', getDeals);

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
router.get('/:dealId', require('../controllers/deal.controller').getDeal);
router.patch('/:dealId', protect, require('../controllers/deal.controller').updateDeal);
router.delete('/:dealId', protect, require('../controllers/deal.controller').deleteDeal);

router.post(
  '/',
  protect,
  createDealValidator,
  validate,
  createDeal
);

module.exports = router;