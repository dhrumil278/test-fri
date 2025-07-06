const { ERROR_CODES } = require("../../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../../config/constants/responseCodes");
const { SUCCESS_CODES } = require("../../config/constants/successCodes");
const {
  findBranchByEmail,
  findBranchById,
  createBranch,
  findAllBranches,
  removeBranch,
  updateBranch,
} = require("../../services/branchService");
const {
  generateUnhandledError,
  generateBadRequest,
  generateErrorResponseFromJoi,
} = require("../../utils/responses/errorResponse");
const { generateOkResponse } = require("../../utils/responses/successResponse");
const {
  branchCreateSchema,
  branchUpdateSchema,
  branchListSchema,
} = require("../../utils/validations/schemas/branch/branchSchema");
const { UUID } = require("../../config/constants/packages");
const { idSchema } = require("../../utils/validations/schemas/common/idSchema");
const { sendMail } = require("../../utils/helpers/mailHelper/sendMail");
const { MAIL_SUBJECTS, MAIL_TYPES } = require("../../config/constants/mail");
const { hashPassword } = require("../../utils/helpers/passwordHelper");

// Create a new branch endpoint
const create = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = branchCreateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, password } = validatedBody;

    // Check if email already exists
    const isEmailExist = await findBranchByEmail(email);
    if (isEmailExist) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.EMAIL_ALREADY_EXISTS));
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Prepare new branch data
    const branchId = UUID();

    const newBranch = {
      ...validatedBody,
      id: branchId,
      password: hashedPassword,
      invitedBy: req?.me?.id || branchId,
      createdBy: req?.me?.id || branchId,
      updatedBy: req?.me?.id || branchId,
    };

    // Create the branch in the database
    const result = await createBranch(newBranch);
    const { dataValues } = await findBranchById(result.id);

    // Send credentials email to the new branch
    const mailObject = {
      mailTo: dataValues.email.toLowerCase(),
      mailsCC: [],
      mailSubject: MAIL_SUBJECTS.BRANCH_CREDENTIAL_MAIL_SUBJECT,
      templateName: MAIL_TYPES.BRANCH_CREDENTIAL_MAIL,
      templatePayload: {
        email: dataValues.email.toLowerCase(),
        password: password,
      },
    };

    await sendMail(mailObject);

    return res
      .status(RESPONSE_CODES.CREATED)
      .json(
        generateOkResponse(SUCCESS_CODES.BRANCH_CREATE_SUCCESS, dataValues)
      );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// List all branches endpoint
const listBranches = async (req, res) => {
  try {
    // Validate query params
    const { error, value: validatedBody } = branchListSchema.validate(
      req.query
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    // Fetch branches with pagination
    const { count, rows: branches } = await findAllBranches(validatedBody);
    // Return success
    return res.status(RESPONSE_CODES.OK).json(
      generateOkResponse(SUCCESS_CODES.BRANCH_LIST_SUCCESS, {
        count,
        branches,
      })
    );
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Update branch details endpoint
const update = async (req, res) => {
  try {
    const { id: adminId } = req.me;
    // Validate params
    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    console.log("errorId: ", errorId);
    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id } = validatedParams;
    // Find branch to update
    const branchToUpdate = await findBranchById(id);
    if (!branchToUpdate || branchToUpdate.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    // Validate request body
    const { error, value: validatedBody } = branchUpdateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email } = validatedBody;
    // Check for email conflict
    if (email && email !== branchToUpdate.email) {
      const emailConflict = await findBranchByEmail(email);
      if (emailConflict) {
        return res
          .status(RESPONSE_CODES.BAD_REQUEST)
          .json(generateBadRequest(ERROR_CODES.EMAIL_ALREADY_EXISTS));
      }
    }

    // Update branch
    await updateBranch(validatedBody, id, adminId);
    const { dataValues: branchData } = await findBranchById(id);

    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(
        generateOkResponse(SUCCESS_CODES.BRANCH_UPDATE_SUCCESS, branchData)
      );
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Delete branch endpoint
const deleteBranch = async (req, res) => {
  try {
    const { id: adminId } = req.me;
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
    // Find branch to delete
    const branchToDelete = await findBranchById(id);
    if (!branchToDelete || branchToDelete.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Soft delete branch
    await removeBranch(id, adminId);
    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.BRANCH_DELETE_SUCCESS));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Get branch by ID endpoint
const getBranch = async (req, res) => {
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
    // Find branch by ID
    const branch = await findBranchById(id);
    if (!branch || branch.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Return branch data
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS, branch));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

module.exports = {
  create,
  update,
  deleteBranch,
  listBranches,
  getBranch,
};
