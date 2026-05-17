const supabase = require('../config/supabase');

exports.createNotification = async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      type,
    } = req.body;

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id,
          title,
          message,
          type,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Notification stored successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};