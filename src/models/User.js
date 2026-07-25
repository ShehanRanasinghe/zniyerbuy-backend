// User Model — Represents a user in the marketplace
// Users can be customers, sellers (shop_owners), or platform admins.

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'customer',
    },
    firebase_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar_url: {
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
    // Human-readable address for the saved latitude/longitude, captured by
    // the Profile page's map location picker (reverse-geocoded on the
    // client, then saved here alongside the coordinates).
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Customer's preferred "show me things within X km" radius, used to
    // filter the home screen's nearby products/shops. One of 1, 2, 5, 10,
    // 20 (enforced client-side; not constrained at the DB level since it's
    // just a display/filter preference, not an integrity-critical value).
    nearby_radius_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
  });

  User.associate = (models) => {
    // A user can own multiple shops (typically one, but schema supports multiple)
    User.hasMany(models.Shop, { foreignKey: 'owner_id', as: 'shops' });
    // A user can leave multiple reviews
    User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
  };

  return User;
};
