// Shop Model — Represents a seller's shop in the marketplace
// Shops contain products, reviews, and deals.

module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
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
    category: {
      type: DataTypes.STRING,
      defaultValue: 'other',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cover_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    opening_hours: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'shops',
    underscored: true,
    timestamps: true,
  });

  Shop.associate = (models) => {
    // A shop belongs to an owner
    Shop.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
    // A shop has many products
    Shop.hasMany(models.Product, { foreignKey: 'shop_id', as: 'products' });
    // A shop has many deals
    Shop.hasMany(models.Deal, { foreignKey: 'shop_id', as: 'deals' });
    // A shop has many reviews
    Shop.hasMany(models.Review, { foreignKey: 'shop_id', as: 'reviews' });
    // A shop has many orders
    Shop.hasMany(models.Order, { foreignKey: 'shop_id', as: 'orders' });
  };

  return Shop;
};
