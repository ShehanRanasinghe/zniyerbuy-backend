// Database Service Layer
// Provides reusable database query functions to avoid code duplication across controllers.
// Why: Centralizes common database operations, making the codebase more maintainable and testable.

const supabase = require('../config/supabase');

/**
 * Get a single record by ID from any table
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {string} select - Fields to select (default: '*')
 * @returns {Promise<{data, error}>}
 */
exports.getById = async (table, id, select = '*') => {
  return await supabase
    .from(table)
    .select(select)
    .eq('id', id)
    .single();
};

/**
 * Get all records from a table with optional filters
 * @param {string} table - Table name
 * @param {object} options - Query options
 * @returns {Promise<{data, error}>}
 */
exports.getAll = async (table, options = {}) => {
  let query = supabase.from(table).select(options.select || '*');

  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options.orderBy) {
    query = query.order(options.orderBy.field, {
      ascending: options.orderBy.ascending || false,
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.range) {
    query = query.range(options.range.from, options.range.to);
  }

  return await query;
};

/**
 * Create a new record
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<{data, error}>}
 */
exports.create = async (table, data) => {
  return await supabase
    .from(table)
    .insert([data])
    .select()
    .single();
};

/**
 * Update a record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {object} data - Data to update
 * @returns {Promise<{data, error}>}
 */
exports.update = async (table, id, data) => {
  return await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
};

/**
 * Delete a record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<{data, error}>}
 */
exports.delete = async (table, id) => {
  return await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select()
    .single();
};

/**
 * Count records in a table with optional filters
 * @param {string} table - Table name
 * @param {object} filters - Filter conditions
 * @returns {Promise<number>}
 */
exports.count = async (table, filters = {}) => {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { count } = await query;
  return count || 0;
};

/**
 * Check if a record exists
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<boolean>}
 */
exports.exists = async (table, id) => {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', id)
    .single();

  return !error && !!data;
};

/**
 * Batch insert multiple records
 * @param {string} table - Table name
 * @param {array} records - Array of records to insert
 * @returns {Promise<{data, error}>}
 */
exports.batchInsert = async (table, records) => {
  return await supabase
    .from(table)
    .insert(records)
    .select();
};

/**
 * Execute a Supabase RPC function
 * @param {string} functionName - RPC function name
 * @param {object} params - Function parameters
 * @returns {Promise<{data, error}>}
 */
exports.rpc = async (functionName, params = {}) => {
  return await supabase.rpc(functionName, params);
};
