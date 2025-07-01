const { FIELDS } = require("../config/constants/fields");
const { SPEAKEASY, OPERATOR } = require("../config/constants/packages");
const Admin = require("../models/admin");
const { getTimestamp } = require("../utils/helpers/time");

const findAdminByEmail = (email) =>
  Admin.findOne({
    where: {
      email,
      isActive: true,
      isDeleted: false,
    },
  });

const updateAdminAuthToken = (authToken, id) =>
  Admin.update(
    { authToken },
    {
      where: { id },
    }
  );

const findAdminById = (id) =>
  Admin.findByPk(id, {
    attributes: {
      exclude: FIELDS.REMOVED_SENSITIVE_ATTRIBUTES,
    },
  });

const createAdmin = (adminData) =>
  Admin.create({
    ...adminData,
    isTwoFAEnabled: false,
    sessionTwoFA: false,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  });

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

const findAdminByIdWithSensitiveDetails = (id) => Admin.findByPk(id);

const findAllAdmins = ({ skip, limit, search, isActive, sortBy, sortType }) => {
  let whereObject = {
    isDeleted: false,
    ...(isActive !== undefined && isActive !== null && { isActive }),
  };

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

const verifyOTP = (otp, secret) => {
  return SPEAKEASY.totp.verify({
    secret: secret,
    encoding: FIELDS.BASE32,
    token: otp,
    window: 2,
  });
};

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
