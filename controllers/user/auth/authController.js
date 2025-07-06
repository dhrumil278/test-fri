// Controller for branch authentication and management endpoints
const { ERROR_CODES } = require("../../../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../../../config/constants/responseCodes");
const { SUCCESS_CODES } = require("../../../config/constants/successCodes");
const {
  findBranchByEmail,
  findBranchById,
  createBranch,
  updateBranchPassword,
  findAllBranches,
  removeBranch,
  updateBranch,
  updateBranchAuthToken,
  updateForgotPwdTokenAndExpiry,
} = require("../../../services/branchService");
const { generateJwtToken } = require("../../../utils/helpers/jwtHelper");
const {
  comparePassword,
  hashPassword,
} = require("../../../utils/helpers/passwordHelper");
const {
  generateUnhandledError,
  generateBadRequest,
  generateErrorResponseFromJoi,
} = require("../../../utils/responses/errorResponse");
const {
  generateOkResponse,
} = require("../../../utils/responses/successResponse");
const {
  changePasswordSchema,
} = require("../../../utils/validations/schemas/common/changePasswordSchema");
const { UUID, bcrypt } = require("../../../config/constants/packages");
const {
  idSchema,
} = require("../../../utils/validations/schemas/common/idSchema");
const {
  skipLimitSearchSchema,
} = require("../../../utils/validations/schemas/common/skipLimitSearchSchema");
const {
  loginSchema,
} = require("../../../utils/validations/schemas/common/loginSchema");
const {
  verifyOTPSchema,
} = require("../../../utils/validations/schemas/common/verifyOtpSchema");
const { sendMail } = require("../../../utils/helpers/mailHelper/sendMail");
const { MAIL_SUBJECTS, MAIL_TYPES } = require("../../../config/constants/mail");
const {
  encryptData,
  decryptData,
} = require("../../../utils/helpers/encryptDecryptSensitiveData");
const {
  otpSchema,
} = require("../../../utils/validations/schemas/common/otpSchema");
const {
  branchCreateSchema,
  branchUpdateSchema,
  branchListSchema,
} = require("../../../utils/validations/schemas/branch/branchSchema");
const {
  forgotPasswordSchema,
  verifyTokenSchema,
  resetPasswordSchema,
} = require("../../../utils/validations/schemas/common/forgotPasswordSchema");
const { MINUTE } = require("../../../utils/helpers/time");

// Branch login endpoint
const login = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = loginSchema.validate(req.body);

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, password } = validatedBody;

    // Find branch by email
    const branchDetails = await findBranchByEmail(email);

    if (!branchDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }

    // Compare provided password with stored hash
    const checkPassword = await comparePassword(
      branchDetails.password,
      password
    );

    if (!checkPassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_PASSWORD));
    }

    // Generate JWT token and update branch's authToken
    const jwtToken = generateJwtToken(branchDetails.id);

    // update the branch's authToken
    await updateBranchAuthToken(jwtToken, branchDetails.id);

    // find the branch by id
    const updatedUserData = await findBranchById(branchDetails.id);

    // prepare the branch data
    const branchData = {
      authToken: jwtToken,
      ...updatedUserData.get({ plain: true }),
    };

    // return the branch data
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.BRANCH_LOGIN_SUCCESS, branchData));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Change password endpoint
const changePassword = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = changePasswordSchema.validate(
      req.body
    );

    if (error) {
      // Return validation error
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { currentPassword, newPassword } = validatedBody;
    const { id, email } = req.me;

    // Find branch by email
    const branchDetails = await findBranchByEmail(email);
    if (!branchDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }

    // Check current password
    const checkPassword = await comparePassword(
      branchDetails.password,
      currentPassword
    );

    if (!checkPassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_CURRENT_PASSWORD));
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await updateBranchPassword(id, hashedPassword, branchDetails.authToken);

    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.BRANCH_PASSWORD_CHANGE_SUCCESS));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Forgot password endpoint
const forgotPassword = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = forgotPasswordSchema.validate(
      req.body
    );
    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }
    const { email, isResend } = validatedBody;
    // Find branch by email
    const branchDetails = await findBranchByEmail(email);
    if (!branchDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }
    // Generate token and expiry
    const token = UUID();
    const forgotPwdExp = Date.now() + 10 * MINUTE; // 10 minutes from now in ms
    await updateForgotPwdTokenAndExpiry(
      email,
      branchDetails.id,
      token,
      forgotPwdExp
    );

    // Prepare and send email
    const mailObject = {
      mailTo: branchDetails.email.toLowerCase(),
      mailsCC: [],
      mailSubject: isResend
        ? MAIL_SUBJECTS.USER_RESEND_FORGOT_PASSWORD_MAIL_SUBJECT
        : MAIL_SUBJECTS.USER_FORGOT_PASSWORD_MAIL_SUBJECT,
      templateName: isResend
        ? MAIL_TYPES.USER_RESEND_FORGOT_PASSWORD
        : MAIL_TYPES.USER_FORGOT_PASSWORD,
      templatePayload: {
        email: branchDetails.email.toLowerCase(),
        url: `${
          process.env.FRONTEND_BASE_ADMIN_URL
        }reset-password?email=${encodeURIComponent(
          branchDetails.email
        )}&token=${token}`,
      },
    };

    await sendMail(mailObject);

    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Verify forgot password token endpoint
const verifyToken = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = verifyTokenSchema.validate(
      req.body
    );
    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }
    const { email, forgotPwdToken } = validatedBody;
    // Find branch by email
    const branchDetails = await findBranchByEmail(email);
    if (!branchDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }
    if (!branchDetails || branchDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Check token
    if (branchDetails.forgotPwdToken !== forgotPwdToken) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_TOKEN));
    }
    // Check expiry
    const forgotPwdTokenExpiry = branchDetails.forgotPwdTokenExpiry;
    if (forgotPwdTokenExpiry < Math.floor(Date.now() / 1000)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.TOKEN_EXPIRED));
    }
    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Reset password endpoint
const resetPassword = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = resetPasswordSchema.validate(
      req.body
    );
    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }
    const { email, password, forgotPwdToken } = validatedBody;
    // Find branch by email
    const branchDetails = await findBranchByEmail(email);
    if (!branchDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }
    if (!branchDetails || branchDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Check token
    if (branchDetails.forgotPwdToken !== forgotPwdToken) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_TOKEN));
    }
    // Check expiry
    const forgotPwdTokenExpiry = branchDetails.forgotPwdTokenExpiry;
    if (forgotPwdTokenExpiry < Math.floor(Date.now() / 1000)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.TOKEN_EXPIRED));
    }
    // Prevent using the same password
    const isSamePassword = await bcrypt.compareSync(
      password,
      branchDetails.password
    );
    if (isSamePassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.SAME_PASSWORD));
    }
    // Hash and update new password
    const hashedPassword = await hashPassword(password);

    // Generate JWT token and update branch's authToken
    const jwtToken = generateJwtToken(branchDetails.id);

    await updateBranchPassword(branchDetails.id, hashedPassword, jwtToken);
    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Branch logout endpoint
const logout = async (req, res) => {
  try {
    const { id } = req.me;

    // Remove auth token from branch
    await updateBranchAuthToken(null, id);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.BRANCH_LOGOUT_SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Get current branch profile endpoint
const getUser = async (req, res) => {
  try {
    const { id } = req.me;
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
  login,
  changePassword,
  logout,
  forgotPassword,
  verifyToken,
  resetPassword,
  getUser,
};
