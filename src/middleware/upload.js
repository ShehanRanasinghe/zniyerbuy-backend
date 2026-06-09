// File Upload Middleware (Multer Configuration)

// Configures Multer for handling multipart/form-data file uploads.
// Uses memory storage to keep uploaded files in RAM as Buffer objects (instead of writing to disk) so they can be directly streamed to Supabase Storage.
// Why memory storage: The server doesn't need to persist files locally.
// Files are received, validated, then immediately uploaded to Supabase cloud storage. 
// Memory storage avoids disk I/O and cleanup concerns.

// Section 1: Dependencies
const multer = require('multer');

// Section 2: Storage Configuration
// memoryStorage() keeps uploaded files as Buffer objects in req.file.buffer.
const storage = multer.memoryStorage();

// Section 3: Multer Instance with Size Limit
// - storage: uses memory storage defined above
// - limits.fileSize: 5MB (5 * 1024 * 1024 bytes) maximum per file
// Why 5MB limit: Prevents excessively large uploads that could consume server memory (since we're using memory storage) and ensures reasonable image file sizes for a marketplace.
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;