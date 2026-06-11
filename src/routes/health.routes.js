// Health Check Routes

// Defines the route for the API health check endpoint.
// Used by monitoring tools and load balancers.
// Why a separate route file: Consistent with the project's one-route-file-per-resource pattern, even for simple endpoints.

// Section 1: Dependencies
const express = require('express');
const router = express.Router();

// Section 2: Controller Import
const {
  healthCheck,
} = require('../controllers/health.controller');

// Section 3: Route Definition
// GET / - Returns server health status (public)
//   No auth required. Monitoring tools need unauthenticated access.
router.get('/', healthCheck);

module.exports = router;