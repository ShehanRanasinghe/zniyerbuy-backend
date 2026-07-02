// Database Connectivity Test Routes

// Provides a simple endpoint to test the Supabase database connection.
// Used during development and deployment to verify the DB is reachable.
// Why: When setting up the environment or debugging connection issues, this endpoint quickly confirms whether Supabase credentials are correct and the database is accessible, without testing business logic.

// Section 1: Dependencies
const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');

// Section 2: Route Definition
// GET /db-test - Tests database connectivity (public)
//   Attempts to read 1 row from the 'users' table.
//   If successful, returns a success message.
//   If it fails, returns the error.
//   Why select from 'users': It's a table that should always exist in the schema. limit(1) keeps the query lightweight.
//   WARNING: This route should be disabled or protected in production to prevent exposing user data.
/**
 * @swagger
 * /test/db-test:
 *   get:
 *     summary: Test database connectivity
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database connected successfully
 *       500:
 *         description: Database connection failed
 */
router.get('/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Supabase connected successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;