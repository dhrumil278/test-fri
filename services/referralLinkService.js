// Service functions for referral link management
const { FIELDS } = require("../config/constants/fields");
const { OPERATOR } = require("../config/constants/packages");
const ReferralLink = require("../models/referralLink");
const User = require("../models/user");
const { getTimestamp } = require("../utils/helpers/time");
const {
  generateHaxCode,
  encryptUUID,
} = require("../utils/helpers/haxCodeHelper");

// Find a referral link by ID
const findReferralLinkById = (id) =>
  ReferralLink.findByPk(id, {
    attributes: {
      exclude: FIELDS.REMOVED_SENSITIVE_ATTRIBUTES,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "role"],
        where: {
          isDeleted: false,
          isActive: true,
        },
        required: false,
      },
    ],
  });

// Find a referral link by haxCode
const findReferralLinkByHaxCode = (haxCode) =>
  ReferralLink.findOne({
    where: {
      haxCode,
      isActive: true,
      isDeleted: false,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "role"],
        where: {
          isDeleted: false,
          isActive: true,
        },
        required: false,
      },
    ],
  });

// Find referral links by user ID
const findReferralLinksByUserId = (userId) =>
  ReferralLink.findAll({
    where: {
      userId,
      isDeleted: false,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "role"],
        where: {
          isDeleted: false,
          isActive: true,
        },
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });

// Create a new referral link
const createReferralLink = (referralLinkData) =>
  ReferralLink.create({
    ...referralLinkData,
    haxCode: encryptUUID(),
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  });

// Find all referral links with optional filters, search, and pagination
const findAllReferralLinks = ({
  skip,
  limit,
  search,
  isActive,
  userId,
  sortBy,
  sortType,
}) => {
  let whereObject = {
    isDeleted: false,
    ...(isActive !== undefined && isActive !== null && { isActive }),
    ...(userId !== undefined && userId !== null && { userId }),
  };

  // Add search filter if provided
  if (search) {
    const searchMatchString = `%${search}%`;
    const searchObject = { [OPERATOR.iLike]: searchMatchString };
    whereObject = {
      [OPERATOR.and]: [
        { ...whereObject },
        {
          [OPERATOR.or]: [{ name: searchObject }],
        },
      ],
    };
  }

  // Pagination options
  const skipLimitObject = {
    ...(skip !== undefined && skip !== null && { offset: skip }),
    ...(limit !== undefined && limit !== null && { limit }),
  };

  return ReferralLink.findAndCountAll({
    where: whereObject,
    ...skipLimitObject,
    order: [
      [FIELDS.IS_ACTIVE, FIELDS.DESC],
      [sortBy, sortType],
    ],
    attributes: {
      exclude: FIELDS.REMOVED_SENSITIVE_ATTRIBUTES,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "role"],
        where: {
          isDeleted: false,
          isActive: true,
        },
        required: false,
      },
    ],
  });
};

// Update referral link details by ID
const updateReferralLink = (override = {}, id, userId) =>
  ReferralLink.update(
    {
      updatedAt: getTimestamp(),
      updatedBy: userId,
      ...override,
    },
    {
      where: {
        id,
      },
    }
  );

// Soft-delete a referral link by marking as deleted and inactive
const removeReferralLink = (id, userId, t) =>
  ReferralLink.update(
    {
      deletedAt: getTimestamp(),
      deletedBy: userId,
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

// Check if haxCode already exists
const checkHaxCodeExists = (haxCode) =>
  ReferralLink.findOne({
    where: {
      haxCode,
      isDeleted: false,
    },
  });

module.exports = {
  findReferralLinkById,
  findReferralLinkByHaxCode,
  findReferralLinksByUserId,
  createReferralLink,
  findAllReferralLinks,
  updateReferralLink,
  removeReferralLink,
  checkHaxCodeExists,
};
