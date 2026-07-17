// Product Model — Represents a product sold by a shop in the marketplace
// Products have stock quantities, ratings, views, and recommendation scores.

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'shops',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    current_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'piece',
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    favorites_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    recommendation_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
  }, {
    tableName: 'products',
    underscored: true,
    timestamps: true,
  });

  Product.associate = (models) => {
    // A product belongs to a shop
    Product.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
    // A product can be referenced by deals
    Product.hasMany(models.Deal, { foreignKey: 'product_id', as: 'deals' });
    // A product can have reviews
    Product.hasMany(models.Review, { foreignKey: 'product_id', as: 'reviews' });
  };

  return Product;
};
