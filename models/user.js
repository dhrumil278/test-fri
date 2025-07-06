// Sequelize model definition for the Admin user
const { ADMIN_ROLE, USER_ROLE } = require("../config/constants/constantValues");
const { DATABASE, DATABASE_DATATYPES } = require("../config/database");

// Define the Admin model schema
const User = DATABASE.define(
  "User",
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
    role: {
      type: DATABASE_DATATYPES.STRING,
      defaultValue: USER_ROLE.BRANCH, // Default role is admin
    },
    forgotPwdToken: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: true,
    },
    forgotPwdTokenExpiry: {
      type: DATABASE_DATATYPES.BIGINT,
      allowNull: true,
    },
    invitedBy: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: true,
      references: {
        model: "admin",
        key: "id",
      },
    },
    parentId: {
      type: DATABASE_DATATYPES.UUID,
      allowNull: true,
      references: {
        model: "user",
        key: "id",
      },
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
    tableName: "user", // Explicit table name
  }
);

// Define model associations
User.associate = (models) => {
  // User belongs to Admin (who invited them)
  User.belongsTo(models.Admin, {
    foreignKey: "invitedBy",
    as: "invitedByAdmin",
  });

  // User belongs to another User (parent-child relationship)
  User.belongsTo(models.User, {
    foreignKey: "parentId",
    as: "parent",
  });

  // User has many child Users
  User.hasMany(models.User, {
    foreignKey: "parentId",
    as: "children",
  });

  // User has many ReferralLinks
  User.hasMany(models.ReferralLink, {
    foreignKey: "userId",
    as: "referralLinks",
  });
};

module.exports = User;
