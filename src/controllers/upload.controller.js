const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const fileName = `${uuidv4()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;

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