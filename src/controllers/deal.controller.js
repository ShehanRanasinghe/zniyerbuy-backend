const supabase = require('../config/supabase');

exports.createDeal = async (req, res) => {
  try {
    const {
      shop_id,
      title,
      description,
      discount_percentage,
      start_date,
      end_date,
    } = req.body;

    const { data, error } = await supabase
      .from('deals')
      .insert([
        {
          shop_id,
          title,
          description,
          discount_percentage,
          start_date,
          end_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getDeals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        shops (
          id,
          name
        )
      `)
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