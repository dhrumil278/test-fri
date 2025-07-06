const { ERROR_CODES } = require("../../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../../config/constants/responseCodes");
const { SUCCESS_CODES } = require("../../config/constants/successCodes");
const {
  findAdminByEmail,
  findAdminById,
  createAdmin,
  updateAdminPassword,
  findAllAdmins,
  removeAdmin,
  updateAdmin,
  updateSession2FA,
  updateTwoFASecretAdmin,
  verifyOTP,
  updateAdminAuthToken,
  updateForgotPwdTokenAndExpiry,
} = require("../../services/adminService");
const { generateJwtToken } = require("../../utils/helpers/jwtHelper");
const {
  comparePassword,
  hashPassword,
} = require("../../utils/helpers/passwordHelper");
const {
  generateUnhandledError,
  generateBadRequest,
  generateErrorResponseFromJoi,
} = require("../../utils/responses/errorResponse");
const { generateOkResponse } = require("../../utils/responses/successResponse");
const {
  changePasswordSchema,
} = require("../../utils/validations/schemas/common/changePasswordSchema");
const {
  UUID,
  SPEAKEASY,
  QR_CODE,
  bcrypt,
} = require("../../config/constants/packages");
const { idSchema } = require("../../utils/validations/schemas/common/idSchema");
const {
  skipLimitSearchSchema,
} = require("../../utils/validations/schemas/common/skipLimitSearchSchema");
const {
  loginSchema,
} = require("../../utils/validations/schemas/common/loginSchema");
const {
  verifyOTPSchema,
} = require("../../utils/validations/schemas/common/verifyOtpSchema");
const { sendMail } = require("../../utils/helpers/mailHelper/sendMail");
const { MAIL_SUBJECTS, MAIL_TYPES } = require("../../config/constants/mail");
const {
  encryptData,
  decryptData,
} = require("../../utils/helpers/encryptDecryptSensitiveData");
const {
  otpSchema,
} = require("../../utils/validations/schemas/common/otpSchema");
const {
  adminCreateSchema,
  adminUpdateSchema,
  adminListSchema,
} = require("../../utils/validations/schemas/admin/adminSchema");
const {
  forgotPasswordSchema,
  verifyTokenSchema,
  resetPasswordSchema,
} = require("../../utils/validations/schemas/common/forgotPasswordSchema");
const { MINUTE } = require("../../utils/helpers/time");

const create = async (req, res) => {
  try {
    const { error, value: validatedBody } = adminCreateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, password } = validatedBody;

    const isEmailExist = await findAdminByEmail(email);
    if (isEmailExist) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.EMAIL_ALREADY_EXISTS));
    }

    const hashedPassword = await hashPassword(password);

    const adminId = UUID();
    console.log("validatedBody: ", validatedBody);

    const newAdmin = {
      ...validatedBody,
      id: adminId,
      password: hashedPassword,
      createdBy: req?.me?.id || adminId,
      updatedBy: req?.me?.id || adminId,
    };

    const result = await createAdmin(newAdmin);

    const { dataValues } = await findAdminById(result.id);

    const mailObject = {
      mailTo: dataValues.email.toLowerCase(),
      mailsCC: [],
      mailSubject: MAIL_SUBJECTS.CREDENTIAL_MAIL_SUBJECT,
      templateName: MAIL_TYPES.CREDENTIAL_MAIL,
      templatePayload: {
        email: dataValues.email.toLowerCase(),
        password: password,
      },
    };

    await sendMail(mailObject);

    return res
      .status(RESPONSE_CODES.CREATED)
      .json(generateOkResponse(SUCCESS_CODES.ADMIN_CREATE_SUCCESS, dataValues));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Admin login endpoint
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

    // Find admin by email
    const adminDetails = await findAdminByEmail(email);

    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }

    // Compare provided password with stored hash
    const checkPassword = await comparePassword(
      adminDetails.password,
      password
    );

    if (!checkPassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_PASSWORD));
    }

    // Generate JWT token and update admin's authToken
    const jwtToken = generateJwtToken(adminDetails.id);

    // update the admin's authToken
    await updateAdminAuthToken(jwtToken, adminDetails.id);

    // find the admin by id
    const updatedUserData = await findAdminById(adminDetails.id);

    // prepare the admin data
    const adminData = {
      authToken: jwtToken,
      ...updatedUserData.get({ plain: true }),
    };

    // return the admin data
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.LOGIN_SUCCESS, adminData));
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

    // Find admin by email
    const adminDetails = await findAdminByEmail(email);
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }

    // Check current password
    const checkPassword = await comparePassword(
      adminDetails.password,
      currentPassword
    );

    if (!checkPassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_CURRENT_PASSWORD));
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await updateAdminPassword(id, hashedPassword, adminDetails.authToken);

    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.PASSWORD_CHANGE_SUCCESS));
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
    // Find admin by email
    const adminDetails = await findAdminByEmail(email);
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }
    // Generate token and expiry
    const token = UUID();
    const forgotPwdExp = Date.now() + 10 * MINUTE; // 10 minutes from now in ms
    await updateForgotPwdTokenAndExpiry(
      email,
      adminDetails.id,
      token,
      forgotPwdExp
    );

    // Prepare and send email
    const mailObject = {
      mailTo: adminDetails.email.toLowerCase(),
      mailsCC: [],
      mailSubject: isResend
        ? MAIL_SUBJECTS.RESEND_FORGOT_PASSWORD_MAIL_SUBJECT
        : MAIL_SUBJECTS.FORGOT_PASSWORD_MAIL_SUBJECT,
      templateName: isResend
        ? MAIL_TYPES.RESEND_FORGOT_PASSWORD
        : MAIL_TYPES.FORGOT_PASSWORD,
      templatePayload: {
        email: adminDetails.email.toLowerCase(),
        url: `${
          process.env.FRONTEND_BASE_ADMIN_URL
        }reset-password?email=${encodeURIComponent(
          adminDetails.email
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
    // Find admin by email
    const adminDetails = await findAdminByEmail(email);
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }
    if (!adminDetails || adminDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Check token
    if (adminDetails.forgotPwdToken !== forgotPwdToken) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_TOKEN));
    }
    // Check expiry
    const forgotPwdTokenExpiry = adminDetails.forgotPwdTokenExpiry;
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
    // Find admin by email
    const adminDetails = await findAdminByEmail(email);
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }
    if (!adminDetails || adminDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Check token
    if (adminDetails.forgotPwdToken !== forgotPwdToken) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_TOKEN));
    }
    // Check expiry
    const forgotPwdTokenExpiry = adminDetails.forgotPwdTokenExpiry;
    if (forgotPwdTokenExpiry < Math.floor(Date.now() / 1000)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.TOKEN_EXPIRED));
    }
    // Prevent using the same password
    const isSamePassword = await bcrypt.compareSync(
      password,
      adminDetails.password
    );
    if (isSamePassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.SAME_PASSWORD));
    }
    // Hash and update new password
    const hashedPassword = await hashPassword(password);

    // Generate JWT token and update admin's authToken
    const jwtToken = generateJwtToken(adminDetails.id);

    await updateAdminPassword(adminDetails.id, hashedPassword, jwtToken);
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

// Admin logout endpoint
const logout = async (req, res) => {
  try {
    const { id } = req.me;

    // Remove auth token from admin
    await updateAdminAuthToken(null, id);
    const adminToUpdate = await findAdminById(id);

    // Reset session 2FA if enabled
    if (adminToUpdate.sessionTwoFA) {
      await updateSession2FA(id, false, adminToUpdate.isTwoFAEnabled);
    }

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.LOGOUT_SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Update admin details endpoint
const update = async (req, res) => {
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
    // Find admin to update
    const adminToUpdate = await findAdminById(id);
    if (!adminToUpdate || adminToUpdate.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    // Validate request body
    const { error, value: validatedBody } = adminUpdateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email } = validatedBody;
    // Check for email conflict
    if (email && email !== adminToUpdate.email) {
      const emailConflict = await findAdminByEmail(email);
      if (emailConflict) {
        return res
          .status(RESPONSE_CODES.BAD_REQUEST)
          .json(generateBadRequest(ERROR_CODES.EMAIL_ALREADY_EXISTS));
      }
    }

    // Update admin
    await updateAdmin(validatedBody, id, adminId);
    const { dataValues: adminData } = await findAdminById(id);

    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.ADMIN_UPDATE_SUCCESS, adminData));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Delete admin endpoint
const deleteAdmin = async (req, res) => {
  try {
    const { id: superAdminId } = req.me;
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
    // Prevent self-deletion
    if (id === superAdminId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.CANNOT_DELETE_SELF));
    }
    // Find admin to delete
    const adminToDelete = await findAdminById(id);
    if (!adminToDelete || adminToDelete.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Soft delete admin
    await removeAdmin(id, superAdminId);
    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.ADMIN_DELETE_SUCCESS));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// List all admins endpoint
const listAdmins = async (req, res) => {
  try {
    // Validate query params
    const { error, value: validatedBody } = adminListSchema.validate(req.query);

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    // Fetch admins with pagination
    const { count, rows: admins } = await findAllAdmins(validatedBody);
    // Return success
    return res
      .status(RESPONSE_CODES.OK)
      .json(
        generateOkResponse(SUCCESS_CODES.ADMIN_LIST_SUCCESS, { count, admins })
      );
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

// Get current admin profile endpoint
const getAdmin = async (req, res) => {
  try {
    const { id } = req.me;
    // Find admin by ID
    const admin = await findAdminById(id);
    if (!admin || admin.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }
    // Return admin data
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS, admin));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

module.exports = {
  create,
  changePassword,
  update,
  deleteAdmin,
  listAdmins,
  getAdmin,
  login,
  logout,
  forgotPassword,
  verifyToken,
  resetPassword,
};
