const express = require('express');
const router = express.Router();

const {
  getApiDocs,
} = require('../controllers/docs.controller');

router.get('/', getApiDocs);

module.exports = router;