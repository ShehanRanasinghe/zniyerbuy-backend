const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

exports.createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      shop_id,
      product_name,
      description,
      price,
      stock_quantity,
      image_url,
      category,
    } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          shop_id,
          product_name,
          description,
          price,
          stock_quantity,
          image_url,
          category,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

exports.getProducts = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const category = req.query.category;
  const sort = req.query.sort || 'newest';
  const keyword = req.query.keyword;

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        shops (
          id,
          name
        )
      `);

    if (category) {
      query = query.eq('category', category);
    }

    if (keyword) {
      query = query.ilike('product_name', `%${keyword}%`);
    }

    let orderField = 'created_at';
    let ascending = false;

    if (sort === 'price_asc') {
      orderField = 'price';
      ascending = true;
    }

    if (sort === 'price_desc') {
      orderField = 'price';
      ascending = false;
    }

    const { data, error } = await query
      .order(orderField, { ascending })
      .range(from, to);

    if (error) throw error;

    res.status(200).json({
      success: true,
      page,
      limit,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

exports.getTrendingProducts = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops (
          id,
          name,
          address
        )
      `)
      .order('average_rating', { ascending: false })
      .order('favorites_count', { ascending: false })
      .order('views', { ascending: false })
      .order('recommendation_score', { ascending: false })
      .limit(limit);

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
});

exports.getRecentlyViewedProducts = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recently_viewed')
      .select(`
        viewed_at,
        products (
          *
        )
      `)
      .eq('user_id', req.user.id)
      .order('viewed_at', { ascending: false })
      .limit(10);

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
});

exports.getRecommendedProducts = asyncHandler(async (req, res) => {
  try {
    const { data: viewedProducts } = await supabase
      .from('recently_viewed')
      .select('product_id')
      .eq('user_id', req.user.id);

    const viewedIds = viewedProducts.map(
      (item) => item.product_id
    );

    let query = supabase
      .from('products')
      .select(`
        *,
        shops (
          id,
          name,
          address
        )
      `)
      .order('recommendation_score', {
        ascending: false,
      })
      .limit(10);

    if (viewedIds.length > 0) {
      query = query.not('id', 'in', `(${viewedIds.join(',')})`);
    }

    const { data, error } = await query;

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
});

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops (
          id,
          name
        )
      `)
      .ilike('name', `%${q}%`)
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

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.rpc('increment_product_views', {
      product_id: req.params.id,
    });

    await supabase.rpc('update_recommendation_score', {
      product_id: req.params.id,
    });

    if (req.user) {
      await supabase
        .from('recently_viewed')
        .insert({
          user_id: req.user.id,
          product_id: req.params.id,
        });
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops (
          id,
          name,
          address,
          contact_number
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateProductImage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({
        image_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Product image updated successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});