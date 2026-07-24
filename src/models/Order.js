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
    // The customer who placed the order. Nullable because orders created
    // before this column existed won't have one, but every new order
    // created through POST /orders always sets it.
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // 'delivery' | 'pickup'
    delivery_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'delivery',
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
    // An order belongs to the customer who placed it
    Order.belongsTo(models.User, { foreignKey: 'customer_id', as: 'customer' });
    // An order has many line items (one per product purchased)
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return Order;
};