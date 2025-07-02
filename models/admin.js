// Sequelize model definition for the Admin user
const { SAAS_OWNER } = require("../config/constants/enums");
const { DATABASE, DATABASE_DATATYPES } = require("../config/database");

// Define the Admin model schema
const Admin = DATABASE.define(
  "Admin",
  {
    id: {
      type: DATABASE_DATATYPES.UUID,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: true,
    },
    lastName: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: true,
    },
    email: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: false,
    },
    password: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: false,
    },
    authToken: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: true,
    },
    twoFASecret: {
      type: DATABASE_DATATYPES.STRING,
      allowNull: true,
    },
    isTwoFAEnabled: {
      type: DATABASE_DATATYPES.BOOLEAN,
      defaultValue: false,
    },
    sessionTwoFA: {
      type: DATABASE_DATATYPES.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DATABASE_DATATYPES.STRING,
      defaultValue: SAAS_OWNER.SUPER_ADMIN, // Default role is super admin
    },
    forgotPwdToken: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: true,
    },
    forgotPwdTokenExpiry: {
      type: DATABASE_DATATYPES.BIGINT,
      allowNull: true,
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
    tableName: "admin", // Explicit table name
  }
);

// Define model associations here if needed
Admin.associate = (models) => {
  // Example: Admin.hasMany(models.Note, ...)
  // Uncomment and modify as needed
};

module.exports = Admin;
