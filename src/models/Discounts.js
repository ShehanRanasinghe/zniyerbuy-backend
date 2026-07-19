// Discounts Model — Represents promotions and deals created by a shop owner
// It supports both the deal form and the promotion form fields from the shop web app.

module.exports = (sequelize, DataTypes) => {
  const Discount = sequelize.define('Discounts', {
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
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discount_kind: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'deal',
    },
    occasion_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount_type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'percentage',
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    deal_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discounted_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'discounts',
    underscored: true,
    timestamps: true,
  });

  Discount.associate = (models) => {
    Discount.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
    Discount.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return Discount;
};
