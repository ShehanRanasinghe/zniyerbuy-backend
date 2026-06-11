// Simple Logging Utility

// Provides timestamped console logging functions for informational messages and errors. 
// Used throughout the application for consistent log formatting.
// Why: Standardizes log output format with [LEVEL] and ISO timestamps so logs are easy to search, filter, and correlate with events.
// Using a centralized logger also makes it easy to swap console output for a production logging service (e.g., Winston, Pino) without changing every file that logs.

// Section 1: Info Logger
// Logs informational messages with [INFO] prefix and ISO timestamp.
// Used for normal operation events (server start, successful operations).
const logInfo = (message) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
};

// Section 2: Error Logger
// Logs error messages with [ERROR] prefix and ISO timestamp.
// Uses console.error so errors go to stderr (important for production log routing and monitoring tools).
const logError = (message) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
};

module.exports = {
  logInfo,
  logError,
};