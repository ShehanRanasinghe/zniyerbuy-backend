const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const {
  uploadProductImage,
} = require('../controllers/upload.controller');

router.post(
  '/product-image',
  protect,
  upload.single('image'),
  uploadProductImage
);

module.exports = router;