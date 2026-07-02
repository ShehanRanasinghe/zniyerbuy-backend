// System Routes

// Defines the route for detailed system health/status information.
// Mounted at /api/v1/system in app.js.
// Why separate from health.routes: system routes may grow to include admin-only diagnostics, config info, or maintenance mode toggles.

// Section 1: Dependencies
const express = require('express');
const router = express.Router();

// Section 2: Controller Import
const {
  getHealth,
} = require('../controllers/system.controller');

// Section 3: Route Definition
// GET /health - Returns detailed system status (public)
//   Includes service name, version, environment, uptime, and timestamp.
/**
 * @swagger
 * /system/health:
 *   get:
 *     summary: Get detailed system health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health information
 */
router.get('/health', getHealth);

module.exports = router;