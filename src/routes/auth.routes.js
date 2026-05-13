const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  registerUser,
  getCurrentUser,
} = require('../controllers/auth.controller');

const {
  registerValidator,
} = require('../validators/auth.validator');

router.post('/register', registerValidator, validate, registerUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;