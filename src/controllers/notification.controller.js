const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

exports.createNotification = asyncHandler(async (req, res) => {
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
});

exports.getUserNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};