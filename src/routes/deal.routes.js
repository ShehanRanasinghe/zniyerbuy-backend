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
router.get('/', getDeals);

router.post(
  '/',
  protect,
  createDealValidator,
  validate,
  createDeal
);

module.exports = router;