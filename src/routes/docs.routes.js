// API Documentation Routes

// Defines the route for the lightweight API docs endpoint that returns a JSON listing of all available endpoint groups.
// Why: Provides a quick API directory at /api/v1/docs without needing to load the full Swagger UI.

// Section 1: Dependencies
const express = require('express');
const router = express.Router();

// Section 2: Controller Import
const {
  getApiDocs,
} = require('../controllers/docs.controller');

// Section 3: Route Definition
// GET / - Returns JSON listing of all API endpoint groups (public)
//   No auth required. This is a reference/discovery endpoint.
router.get('/', getApiDocs);

module.exports = router;