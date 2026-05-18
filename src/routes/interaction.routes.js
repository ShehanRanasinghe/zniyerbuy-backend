const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  trackInteractionValidator,
} = require('../validators/interaction.validator');

const {
  trackInteraction,
} = require('../controllers/interaction.controller');

router.post(
  '/',
  protect,
  trackInteractionValidator,
  validate,
  trackInteraction
);

module.exports = router;