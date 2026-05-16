const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createDealValidator,
} = require('../validators/deal.validator');

const {
  createDeal,
} = require('../controllers/deal.controller');

router.post(
  '/',
  protect,
  createDealValidator,
  validate,
  createDeal
);

module.exports = router;