const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createReviewValidator,
} = require('../validators/review.validator');

const {
  createReview,
} = require('../controllers/review.controller');

router.post(
  '/',
  protect,
  createReviewValidator,
  validate,
  createReview
);

module.exports = router;