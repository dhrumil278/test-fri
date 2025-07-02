// Service functions for admin user management and authentication
const { FIELDS } = require("../config/constants/fields");
const { SPEAKEASY, OPERATOR } = require("../config/constants/packages");
const Admin = require("../models/admin");
const { getTimestamp } = require("../utils/helpers/time");

// Find an active, non-deleted admin by email
const findAdminByEmail = (email) =>
  Admin.findOne({
    where: {
      email,
      isActive: true,
      isDeleted: false,
    },
  });

// Update the auth token for an admin by ID
const updateAdminAuthToken = (authToken, id) =>
  Admin.update(
    { authToken },
    {
      where: { id },
    }
  );

// Find an admin by primary key, excluding sensitive attributes
const findAdminById = (id) =>
  Admin.findByPk(id, {
    attributes: {
      exclude: FIELDS.REMOVED_SENSITIVE_ATTRIBUTES,
    },
  });

// Create a new admin user
const createAdmin = (adminData) =>
  Admin.create({
    ...adminData,
    isTwoFAEnabled: false,
    sessionTwoFA: false,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  });

// Update the password for an admin user
const updateAdminPassword = (userId, newPassword) =>
  Admin.update(
    {
      password: newPassword,
      updatedAt: getTimestamp(),
      updatedBy: userId,
    },
    {
      where: { id: userId },
    }
  );

// Find an admin by ID, including sensitive details
const findAdminByIdWithSensitiveDetails = (id) => Admin.findByPk(id);

// Find all admins with optional filters, search, and pagination
const findAllAdmins = ({ skip, limit, search, isActive, sortBy, sortType }) => {
  let whereObject = {
    isDeleted: false,
    ...(isActive !== undefined && isActive !== null && { isActive }),
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

  return Admin.findAndCountAll({
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

// Update admin details by ID
const updateAdmin = (override = {}, id, adminId) =>
  Admin.update(
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

// Soft-delete an admin by marking as deleted and inactive
const removeAdmin = (id, adminId, t) =>
  Admin.update(
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

// Update the 2FA secret for an admin
const updateTwoFASecretAdmin = (twoFASecret, id) =>
  Admin.update(
    {
      updatedAt: getTimestamp(),
      updatedBy: id,
      twoFASecret,
    },
    {
      where: {
        id,
      },
    }
  );

// Verify a one-time password (OTP) using the 2FA secret
const verifyOTP = (otp, secret) => {
  return SPEAKEASY.totp.verify({
    secret: secret,
    encoding: FIELDS.BASE32,
    token: otp,
    window: 2,
  });
};

// Update session 2FA status and enable/disable 2FA for an admin
const updateSession2FA = (id, status, isTwoFAEnabled) =>
  Admin.update(
    {
      updatedAt: getTimestamp(),
      updatedBy: id,
      sessionTwoFA: status,
      isTwoFAEnabled: isTwoFAEnabled,
    },
    {
      where: {
        id,
      },
    }
  );

// Update forgot password token and expiry for an admin
const updateForgotPwdTokenAndExpiry = (email, id, token, forgotPwdExp) =>
  Admin.update(
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
  findAdminByEmail,
  updateAdminAuthToken,
  findAdminById,
  createAdmin,
  updateAdminPassword,
  findAdminByIdWithSensitiveDetails,
  findAllAdmins,
  removeAdmin,
  updateAdmin,
  updateTwoFASecretAdmin,
  verifyOTP,
  updateSession2FA,
  updateForgotPwdTokenAndExpiry,
};
