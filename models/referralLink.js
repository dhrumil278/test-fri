// Sequelize model definition for the Admin user
const { ADMIN_ROLE, USER_ROLE } = require("../config/constants/constantValues");
const { DATABASE, DATABASE_DATATYPES } = require("../config/database");

// Define the ReferralLink model schema
const ReferralLink = DATABASE.define(
  "ReferralLink",
  {
    id: {
      type: DATABASE_DATATYPES.UUID,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: true,
    },
    userId: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: false,
      references: {
        model: "user", // Reference to the User model
        key: "id",
      },
    },
    haxCode: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: false,
      unique: true, // Ensure haxCode is unique
    },
    isActive: {
      type: DATABASE_DATATYPES.BOOLEAN,
      defaultValue: true,
    },
    isDeleted: {
      type: DATABASE_DATATYPES.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DATABASE_DATATYPES.BIGINT,
      allowNull: false,
    },
    createdBy: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: false,
    },
    updatedAt: {
      type: DATABASE_DATATYPES.BIGINT,
      allowNull: false,
    },
    updatedBy: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: false,
    },
    deletedAt: {
      type: DATABASE_DATATYPES.BIGINT,
      allowNull: true,
    },
    deletedBy: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: false, // Disable automatic timestamps
    tableName: "referral_link", // Fixed table name
  }
);

// Define model associations
ReferralLink.associate = (models) => {
  ReferralLink.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

module.exports = ReferralLink;
