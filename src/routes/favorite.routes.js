const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  addFavoriteValidator,
} = require('../validators/favorite.validator');

const {
  addFavorite,
  getFavorites,
} = require('../controllers/favorite.controller');

router.get('/', protect, getFavorites);

router.post(
  '/',
  protect,
  addFavoriteValidator,
  validate,
  addFavorite
);

module.exports = router;