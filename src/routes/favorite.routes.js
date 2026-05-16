const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  addFavoriteValidator,
} = require('../validators/favorite.validator');

const {
  addFavorite,
} = require('../controllers/favorite.controller');

router.post(
  '/',
  protect,
  addFavoriteValidator,
  validate,
  addFavorite
);

module.exports = router;