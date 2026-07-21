require('dotenv').config();
require('./src/config/env');

const { logInfo, logError } = require('./src/utils/logger');

const app = require('./src/app');
const db = require('./src/models');
const admin = require('./src/config/firebase');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Previously this ran db.sequelize.sync({ alter: true }) on every single server start. That does a full schema introspection + diff against
    // every model on every boot - slow (especially against a remote Supabase/Postgres host), and it re-runs on every nodemon restart
    // during development, which is why the backend felt slow to "load." It's also risky to run automatically in any environment other than
    // local dev (unreviewed ALTER TABLE statements). Now that proper sequelize-cli migrations exist as the single source of schema truth,
    // we just verify connectivity here instead - schema changes go through `npx sequelize-cli db:migrate`.
    await db.sequelize.authenticate();
    logInfo('Database connection verified (Sequelize)');
  } catch (err) {
    logError(`Database connection failed: ${err.message}`);
    // Don't crash - Supabase may still work for queries even if this check fails
  }

  app.listen(PORT, async () => {
    logInfo(`Server running on http://localhost:${PORT}`);

    // Verify Firebase Admin SDK credentials are valid
    try {
      await admin.auth().listUsers(1);
      logInfo('Firebase Admin SDK connected successfully');
    } catch (err) {
      logError(`Firebase Admin SDK connection failed: ${err.message}`);
    }
  });
}

startServer();
