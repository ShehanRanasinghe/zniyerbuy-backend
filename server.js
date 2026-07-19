require('dotenv').config();
require('./src/config/env');

const { logInfo, logError } = require('./src/utils/logger');

const app = require('./src/app');
const db = require('./src/models');
const admin = require('./src/config/firebase');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Sync Sequelize models to the PostgreSQL database.
    // alter: true adds/modifies columns without dropping existing data.
    // Why: Creates all tables automatically without needing manual SQL commands in Supabase.
    await db.sequelize.sync({ alter: true });
    logInfo('Database synced successfully (Sequelize)');
  } catch (err) {
    logError(`Database sync failed: ${err.message}`);
    // Don't crash — Supabase may still work for queries even if sync has a warning
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