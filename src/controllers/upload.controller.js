// Image Upload Controller

// Handles uploading product and shop images to Supabase Storage.
// Files are received via multer (memory storage) and uploaded to separate storage buckets for products and shops.
// Why separate buckets: Organizing images into 'product-images' and 'shop-images' buckets makes storage management, access control, and CDN configuration cleaner.

// Section 1: Dependencies
// - supabase: used for Storage API to upload files and get public URLs
// - uuidv4: generates unique filenames to prevent collisions
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Section 2: Upload Product Image
// POST /api/v1/uploads/product-image
// Uploads a single product image to the 'product-images' bucket.
// Flow:
//   1. Check that a file was included in the request
//   2. Generate a unique filename using UUID + original filename
//   3. Upload the file buffer to Supabase Storage
//   4. Get the public URL of the uploaded file
//   5. Return the public URL to the client
// Why UUID prefix: Prevents filename collisions when multiple users upload files with the same name (e.g., "image.jpg").

exports.uploadProductImage = async (req, res) => {
  try {
    // Validate that a file was provided in the multipart request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Generate unique filename: UUID + original name for traceability
    const fileName = `${uuidv4()}-${req.file.originalname}`;

    // Upload file buffer to the 'product-images' storage bucket
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;

    // Generate the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    res.status(200).json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Section 3: Upload Shop Image
// POST /api/v1/uploads/shop-image
// Uploads a single shop image to the 'shop-images' bucket.
// Identical flow to uploadProductImage but targets a different storage bucket.
// Why not a single generic upload function: Separate functions allow different validation rules, file size limits, or storage policies per resource type in the future.

exports.uploadShopImage = async (req, res) => {
  try {
    // Validate that a file was provided in the multipart request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Generate unique filename: UUID + original name for traceability
    const fileName = `${uuidv4()}-${req.file.originalname}`;

    // Upload file buffer to the 'shop-images' storage bucket
    const { error } = await supabase.storage
      .from('shop-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;

    // Generate the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage
      .from('shop-images')
      .getPublicUrl(fileName);

    res.status(200).json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};