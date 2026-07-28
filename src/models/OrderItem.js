// OrderItem Model - A single product line within an order
// Why this exists: 'orders' only ever stored a single items_count integer
// and total_amount, with no way to show which products (and how many of
// each, at what price) made up an order. Each row here is one product
// line, so an order with 3 different products has 3 order_items rows.

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    // Set only when this item was purchased at an active deal/promotion
    // price, so the order card can show a "Deal applied" label.
    discount_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'discounts',
        key: 'id',
      },
    },
    // Snapshotted at purchase time so the order still displays correctly
    // even if the product is later renamed, repriced, or deleted.
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    line_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'order_items',
    underscored: true,
    timestamps: true,
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    OrderItem.belongsTo(models.Discounts, { foreignKey: 'discount_id', as: 'discount' });
  };

  return OrderItem;
};