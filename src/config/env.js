// Environment Variable Validation

// This file validates that all required environment variables are present at application startup. 
// If any are missing, the process throws an error immediately to prevent the server from running in a broken state.
// Why: Fail-fast approach ensures configuration issues are caught during deployment rather than at runtime when a missing variable causes a cryptic error deep inside business logic.

// Section 1: Required Environment Variables List
// Each entry maps to a critical external service:
//   - PORT: the HTTP port the server listens on
//   - SUPABASE_URL: the Supabase project REST API URL
//   - SUPABASE_SERVICE_KEY: server-side Supabase key with full access
//   - FIREBASE_PROJECT_ID: identifies the Firebase project
//   - FIREBASE_PRIVATE_KEY: service account private key for token verification
//   - FIREBASE_CLIENT_EMAIL: service account email for Firebase Admin SDK
const requiredEnvVars = [
  'PORT',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
];

// Section 2: Validation Loop
// Iterates over each required variable and throws an error if it is undefined or empty. 
// This runs synchronously at import time, so the app never reaches app.listen() if validation fails.

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

module.exports = true;