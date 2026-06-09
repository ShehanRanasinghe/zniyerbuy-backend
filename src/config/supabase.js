// Supabase Client Initialization

// Creates and exports a Supabase client configured with the service role key. 
// This client has full admin access to the database, bypassing Row Level Security (RLS) policies.
// Why: The backend acts as a trusted server and needs unrestricted database access to perform CRUD operations on behalf of any user.
// The service key should NEVER be exposed to the client/frontend.

// Section 1: Supabase Client Import
const { createClient } = require('@supabase/supabase-js');

// Section 2: Client Configuration & Creation
// - SUPABASE_URL: the project's REST API endpoint
// - SUPABASE_SERVICE_KEY: server-side key with full DB access
// - autoRefreshToken: false because server-side tokens don't expire the same way client tokens do.
// - persistSession: false because the server is stateless and should not store session data between requests.
// Why these settings: The server creates a fresh auth context per request, so session persistence and auto-refresh are unnecessary.

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = supabase;