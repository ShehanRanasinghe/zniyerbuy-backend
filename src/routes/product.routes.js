const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  createProductValidator,
} = require('../validators/product.validator');

const {
  createProduct,
  getProducts,
  searchProducts,
} = require('../controllers/product.controller');

router.get('/search', searchProducts);

router.get('/', getProducts);

router.post(
  '/',
  protect,
  createProductValidator,
  validate,
  createProduct
);

module.exports = router;