require('dotenv').config();
require('./src/config/env');

const { logInfo, logError } = require('./src/utils/logger');

const app = require('./src/app');
const supabase = require('./src/config/supabase');
const admin = require('./src/config/firebase');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  logInfo(`Server running on http://localhost:${PORT}`);

  // Run Supabase and Firebase connectivity checks in parallel.
  // Why: Running them concurrently reduces total startup time instead of waiting for each check sequentially.
  await Promise.allSettled([

    // Supabase: verify DB is reachable with a lightweight row fetch.
    // Why: Supabase JS client is HTTP-based and doesn't emit a "connected" event.
    supabase
      .from('users')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (error) throw error;
        logInfo('Supabase database connected successfully');
      })
      .catch((err) => {
        logError(`Supabase database connection failed: ${err.message}`);
      }),

    // Firebase: verify Admin SDK credentials are valid by listing 1 user from Auth.
    // Why: listUsers() makes a real API call to Firebase Auth — the same service used to verify tokens on protected routes. If credentials are wrong or network is down, this will fail fast.
    admin
      .auth()
      .listUsers(1)
      .then(() => {
        logInfo('Firebase Admin SDK connected successfully');
      })
      .catch((err) => {
        logError(`Firebase Admin SDK connection failed: ${err.message}`);
      }),

  ]);
});