const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/profile', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected route accessed',
    user: req.user,
  });
});

module.exports = router;