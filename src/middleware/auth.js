const admin = require('../config/firebase');
const supabase = require('../config/supabase');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', decoded.uid)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};