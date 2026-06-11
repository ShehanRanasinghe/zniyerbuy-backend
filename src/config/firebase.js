// Firebase Admin SDK Initialization

// Initializes the Firebase Admin SDK with service account credentials from environment variables. 
// The Admin SDK is used server-side to verify Firebase ID tokens sent by the mobile/web client.
// Why: Firebase handles user authentication (sign-up, login, OAuth).
// The backend needs the Admin SDK to verify tokens on protected routes and ensure the requesting user is who they claim to be.

// Section 1: Firebase Admin Import
const admin = require('firebase-admin');

// Section 2: Conditional Initialization

// Checks if a Firebase app has already been initialized to prevent duplicate initialization errors (e.g., during hot-reloads in dev).
// Why: firebase-admin throws if initializeApp() is called twice.
// The guard ensures idempotent module imports.

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,

      // Replace escaped newlines in the private key string.
      // Why: Environment variables often store the key with literal "\n" characters instead of actual newlines. 
      // This replacement ensures the PEM format is valid for cryptographic operations.
      
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Section 3: Module Export
// Exports the initialized admin instance so other modules can use admin.auth().verifyIdToken() for authentication checks.
module.exports = admin;