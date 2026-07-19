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
    customer_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // 'cod' | 'paid' | 'pickup'
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'cod',
    },
    // Editable per-order; deliberately no fixed platform default
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    invoice_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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