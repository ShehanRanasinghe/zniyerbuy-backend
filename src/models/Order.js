// Order Model — Represents a customer's order for a shop
// Orders drive order tracking, fulfillment, and revenue metrics.

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    items_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    tableName: 'orders',
    underscored: true,
    timestamps: true,
  });

  Order.associate = (models) => {
    // An order belongs to a shop
    Order.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
  };

  return Order;
};
