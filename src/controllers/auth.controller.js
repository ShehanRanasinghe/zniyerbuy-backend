const supabase = require('../config/supabase');

exports.registerUser = async (req, res) => {
  try {
    const {
      firebase_uid,
      email,
      full_name,
      role,
    } = req.body;

    // Check existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          firebase_uid,
          email,
          full_name,
          role: role || 'consumer',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};