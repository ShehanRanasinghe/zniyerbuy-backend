const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createDealValidator,
} = require('../validators/deal.validator');

const {
  createDeal,
  getDeals,
} = require('../controllers/deal.controller');

router.get('/', getDeals);

router.post(
  '/',
  protect,
  createDealValidator,
  validate,
  createDeal
);

module.exports = router;