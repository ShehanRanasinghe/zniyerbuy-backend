// Review Model — Represents a review left for a shop or product
// Reviews support seller replies.

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shop_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shop_reply_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
  });

  Review.associate = (models) => {
    // A review belongs to a user reviewer
    Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    // A review belongs to a shop
    Review.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
    // A review can belong to a product
    Review.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return Review;
};
