const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const checkProductOwnership = require('../middleware/checkProductOwnership');

const {
  createProductValidator,
} = require('../validators/product.validator');

const {
  updateProductImageValidator,
} = require('../validators/upload.validator');

const {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProductImage,
  getTrendingProducts,
  getRecentlyViewedProducts,
} = require('../controllers/product.controller');

router.get( '/recently-viewed',protect,getRecentlyViewedProducts);

router.get('/trending', getTrendingProducts);

router.get('/search', searchProducts);

router.patch(
  '/:id/image',
  protect,
  authorize('shop_owner', 'admin'),
  checkProductOwnership,
  updateProductImageValidator,
  validate,
  updateProductImage
);

router.get('/:id', getProductById);

router.get('/', getProducts);

router.post(
  '/',
  protect,
  createProductValidator,
  validate,
  createProduct
);

module.exports = router;