// Service functions for branch user management and authentication
const { FIELDS } = require("../config/constants/fields");
const { SPEAKEASY, OPERATOR } = require("../config/constants/packages");
const User = require("../models/user");
const { getTimestamp } = require("../utils/helpers/time");

// Find an active, non-deleted branch by email
const findBranchByEmail = (email) =>
  User.findOne({
    where: {
      email,
      isActive: true,
      isDeleted: false,
    },
  });

// Update the auth token for a branch by ID
const updateBranchAuthToken = (authToken, id) =>
  User.update(
    { authToken },
    {
      where: { id },
    }
  );

// Find a branch by primary key, excluding sensitive attributes
const findBranchById = (id) =>
  User.findByPk(id, {
    attributes: {
      exclude: FIELDS.REMOVED_SENSITIVE_ATTRIBUTES,
    },
  });

// Create a new branch user
const createBranch = (branchData) =>
  User.create({
    ...branchData,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  });

// Find a branch by ID, including sensitive details
const findBranchByIdWithSensitiveDetails = (id) => User.findByPk(id);

// Find all branches with optional filters, search, and pagination
const findAllBranches = ({
  skip,
  limit,
  search,
  isActive,
  sortBy,
  sortType,
  role,
}) => {
  let whereObject = {
    isDeleted: false,
    ...(isActive !== undefined && isActive !== null && { isActive }),
    ...(role !== undefined && role !== null && { role }),
  };

  // Add search filter if provided
  if (search) {
    const searchMatchString = `%${search}%`;
    const searchObject = { [OPERATOR.iLike]: searchMatchString };
    whereObject = {
      [OPERATOR.and]: [
        { ...whereObject },
        {
          [OPERATOR.or]: [
            { firstName: searchObject },
            { lastName: searchObject },
            { email: searchObject },
          ],
        },
      ],
    };
  }

  // Pagination options
  const skipLimitObject = {
    ...(skip !== undefined && skip !== null && { offset: skip }),
    ...(limit !== undefined && limit !== null && { limit }),
  };

  return User.findAndCountAll({
    where: whereObject,
    ...skipLimitObject,
    order: [
      [FIELDS.IS_ACTIVE, FIELDS.DESC],
      [sortBy, sortType],
    ],
    attributes: {
      exclude: FIELDS.REMOVED_SENSITIVE_ATTRIBUTES,
    },
  });
};

// Update branch details by ID
const updateBranch = (override = {}, id, adminId) =>
  User.update(
    {
      updatedAt: getTimestamp(),
      updatedBy: adminId,
      ...override,
    },
    {
      where: {
        id,
      },
    }
  );

// Soft-delete a branch by marking as deleted and inactive
const removeBranch = (id, adminId, t) =>
  User.update(
    {
      deletedAt: getTimestamp(),
      deletedBy: adminId,
      isDeleted: true,
      isActive: false,
    },
    {
      where: {
        id,
      },
      transaction: t,
    }
  );

// Update the password for a branch user
const updateBranchPassword = (userId, newPassword, token) =>
  User.update(
    {
      password: newPassword,
      updatedAt: getTimestamp(),
      updatedBy: userId,
      authToken: token,
      forgotPwdToken: null,
      forgotPwdTokenExpiry: null,
    },
    {
      where: { id: userId },
    }
  );

// Update forgot password token and expiry for a branch
const updateForgotPwdTokenAndExpiry = (email, id, token, forgotPwdExp) =>
  User.update(
    {
      updatedAt: getTimestamp(),
      updatedBy: id,
      forgotPwdToken: token,
      forgotPwdTokenExpiry: forgotPwdExp,
    },
    {
      where: {
        email,
        isDeleted: false,
      },
    }
  );

module.exports = {
  findBranchByEmail,
  updateBranchAuthToken,
  findBranchById,
  createBranch,
  findBranchByIdWithSensitiveDetails,
  findAllBranches,
  removeBranch,
  updateBranch,
  updateBranchPassword,
  updateForgotPwdTokenAndExpiry,
};
