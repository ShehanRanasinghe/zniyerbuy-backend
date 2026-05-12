const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  registerUser,
  getCurrentUser,
} = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;