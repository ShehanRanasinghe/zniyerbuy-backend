// Sequelize Database Configuration
// Connects to Supabase PostgreSQL via DATABASE_URL environment variable.
// SSL is required for Supabase connections.

require('dotenv').config();

const dbConfig = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false, // Suppress verbose SQL logs in console
};

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    ...dbConfig,
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    ...dbConfig,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    ...dbConfig,
  },
};
