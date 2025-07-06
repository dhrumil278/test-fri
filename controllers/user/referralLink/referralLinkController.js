// Controller for referral link management endpoints
const { ERROR_CODES } = require("../../../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../../../config/constants/responseCodes");
const { SUCCESS_CODES } = require("../../../config/constants/successCodes");
const {
  findReferralLinkById,
  findReferralLinkByHaxCode,
  findReferralLinksByUserId,
  createReferralLink,
  findAllReferralLinks,
  updateReferralLink,
  removeReferralLink,
  checkHaxCodeExists,
} = require("../../../services/referralLinkService");
const {
  generateUnhandledError,
  generateBadRequest,
  generateErrorResponseFromJoi,
} = require("../../../utils/responses/errorResponse");
const {
  generateOkResponse,
} = require("../../../utils/responses/successResponse");
const {
  referralLinkCreateSchema,
  referralLinkUpdateSchema,
  referralLinkListSchema,
  referralLinkGetByHaxCodeSchema,
} = require("../../../utils/validations/schemas/referralLink/referralLinkSchema");
const { UUID } = require("../../../config/constants/packages");
const {
  idSchema,
} = require("../../../utils/validations/schemas/common/idSchema");

// Create a new referral link endpoint
const create = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = referralLinkCreateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { id } = req.me;

    // Prepare new referral link data
    const referralLinkId = UUID();

    const newReferralLink = {
      ...validatedBody,
      userId: id, // Use the authenticated user's ID
      id: referralLinkId,
      createdBy: req?.me?.id || referralLinkId,
      updatedBy: req?.me?.id || referralLinkId,
    };

    // Create the referral link in the database
    const result = await createReferralLink(newReferralLink);
    const { dataValues } = await findReferralLinkById(result.id);

    return res
      .status(RESPONSE_CODES.CREATED)
      .json(
        generateOkResponse(
          SUCCESS_CODES.REFERRAL_LINK_CREATE_SUCCESS,
          dataValues
        )
      );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// List all referral links endpoint
const listReferralLinks = async (req, res) => {
  try {
    // Validate query params
    const { error, value: validatedBody } = referralLinkListSchema.validate(
      req.query
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    // Fetch referral links with pagination
    const { count, rows: referralLinks } = await findAllReferralLinks(
      validatedBody
    );

    return res.status(RESPONSE_CODES.OK).json(
      generateOkResponse(SUCCESS_CODES.REFERRAL_LINK_LIST_SUCCESS, {
        count,
        referralLinks,
      })
    );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Get referral links by user ID endpoint
const getReferralLinksByUserId = async (req, res) => {
  try {
    // Validate params
    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id: userId } = validatedParams;

    // Fetch referral links for the user
    const referralLinks = await findReferralLinksByUserId(userId);

    return res.status(RESPONSE_CODES.OK).json(
      generateOkResponse(SUCCESS_CODES.REFERRAL_LINK_LIST_SUCCESS, {
        referralLinks,
      })
    );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Get referral link by haxCode endpoint
const getReferralLinkByHaxCode = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } =
      referralLinkGetByHaxCodeSchema.validate(req.body);

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { haxCode } = validatedBody;

    // Find referral link by haxCode
    const referralLink = await findReferralLinkByHaxCode(haxCode);

    if (!referralLink) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_REFERRAL_LINK));
    }

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS, referralLink));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Update referral link details endpoint
const update = async (req, res) => {
  try {
    const { id: userId } = req.me;

    // Validate params
    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id } = validatedParams;

    // Find referral link to update
    const referralLinkToUpdate = await findReferralLinkById(id);
    if (!referralLinkToUpdate || referralLinkToUpdate.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    // Validate request body
    const { error, value: validatedBody } = referralLinkUpdateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    // Update referral link
    await updateReferralLink(validatedBody, id, userId);
    const { dataValues: referralLinkData } = await findReferralLinkById(id);

    return res
      .status(RESPONSE_CODES.OK)
      .json(
        generateOkResponse(
          SUCCESS_CODES.REFERRAL_LINK_UPDATE_SUCCESS,
          referralLinkData
        )
      );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Delete referral link endpoint
const deleteReferralLink = async (req, res) => {
  try {
    const { id: userId } = req.me;

    // Validate params
    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id } = validatedParams;

    // Find referral link to delete
    const referralLinkToDelete = await findReferralLinkById(id);
    if (!referralLinkToDelete || referralLinkToDelete.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    // Soft delete referral link
    await removeReferralLink(id, userId);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.REFERRAL_LINK_DELETE_SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Get referral link by ID endpoint
const getReferralLink = async (req, res) => {
  try {
    // Validate params
    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id } = validatedParams;

    // Find referral link by ID
    const referralLink = await findReferralLinkById(id);
    if (!referralLink || referralLink.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS, referralLink));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

module.exports = {
  create,
  update,
  deleteReferralLink,
  listReferralLinks,
  getReferralLink,
  getReferralLinksByUserId,
  getReferralLinkByHaxCode,
};
