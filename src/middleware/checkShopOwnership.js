const supabase = require('../config/supabase');

const checkShopOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('shops')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found',
      });
    }

    if (
      data.owner_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized shop access',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = checkShopOwnership;