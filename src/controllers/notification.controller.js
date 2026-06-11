// Notification Controller

// Handles creating and retrieving user notifications. 
// Notifications inform users about deals, order updates, and other platform events.
// Why: Notifications keep users engaged with the platform by alerting them to relevant events (new deals, price drops, order status changes).

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Create Notification
// POST /api/v1/notifications
// Creates a notification record for a specific user.
// Flow:
//   1. Extract notification data (user_id, title, message, type) from body
//   2. Insert into the 'notifications' table
//   3. Return the created notification
// Why user_id comes from body (not req.user): Notifications can be sent to any user by admin or system processes, not just the currently authenticated user.

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

// Section 3: Get User Notifications
// GET /api/v1/notifications
// Retrieves all notifications for the authenticated user.
// Ordered newest-first so the most recent alerts appear on top.
// Why filter by req.user.id: Users should only see their own notifications, enforcing per-user data isolation.

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