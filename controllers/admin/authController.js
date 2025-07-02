// Controller for admin authentication and management endpoints
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
} = require("../../utils/validations/schemas/admin/adminSchema");
const {
  forgotPasswordSchema,
  verifyTokenSchema,
  resetPasswordSchema,
} = require("../../utils/validations/schemas/common/forgotPasswordSchema");
const { MINUTE } = require("../../utils/helpers/time");

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

    // If 2FA is enabled, prompt for OTP verification
    if (adminDetails.isTwoFAEnabled) {
      return res.status(RESPONSE_CODES.OK).json(
        generateOkResponse(SUCCESS_CODES.VERIFY_OTP, {
          isTwoFAEnabled: adminDetails.isTwoFAEnabled,
        })
      );
    } else {
      // Generate JWT token and update admin's authToken
      const jwtToken = generateJwtToken(adminDetails.id);
      await updateAdminAuthToken(jwtToken, adminDetails.id);
      const updatedUserData = await findAdminById(adminDetails.id);
      const adminData = {
        authToken: jwtToken,
        ...updatedUserData.get({ plain: true }),
      };
      return res
        .status(RESPONSE_CODES.OK)
        .json(generateOkResponse(SUCCESS_CODES.LOGIN_SUCCESS, adminData));
    }
  } catch (error) {
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

// Create a new admin endpoint
const create = async (req, res) => {
  try {
    // Validate request body
    const { error, value: validatedBody } = adminCreateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, password } = validatedBody;

    // Check if email already exists
    const isEmailExist = await findAdminByEmail(email);
    if (isEmailExist) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.EMAIL_ALREADY_EXISTS));
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Prepare new admin data
    const adminId = UUID();
    const newAdmin = {
      ...validatedBody,
      id: adminId,
      password: hashedPassword,
      createdBy: req?.me?.id || adminId,
      updatedBy: req?.me?.id || adminId,
    };

    // Create the admin in the database
    const result = await createAdmin(newAdmin);
    const { dataValues } = await findAdminById(result.id);

    // Send credentials email to the new admin
    const mailObject = {
      mailTo: dataValues.email.toLowerCase(),
      mailsCC: [],
      mailSubject: MAIL_SUBJECTS.CREDENTIAL_MAIL_SUBJECT,
      templateName: MAIL_TYPES.CREDENTIAL_MAIL,
      templatePayload: {
        email: dataValues.email.toLowerCase(),
        password: password,
      },
      sendMailThroughClinic: false,
      clinicId: null,
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

const changePassword = async (req, res) => {
  try {
    const { error, value: validatedBody } = changePasswordSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { currentPassword, newPassword } = validatedBody;

    const { id, email } = req.me;

    const adminDetails = await findAdminByEmail(email);
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }

    const checkPassword = await comparePassword(
      adminDetails.password,
      currentPassword
    );

    if (!checkPassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_CURRENT_PASSWORD));
    }

    const hashedPassword = await hashPassword(newPassword);

    await updateAdminPassword(id, hashedPassword);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.PASSWORD_CHANGE_SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const update = async (req, res) => {
  try {
    const { id: adminId } = req.me;

    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id } = validatedParams;

    const adminToUpdate = await findAdminById(id);

    if (!adminToUpdate || adminToUpdate.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { error, value: validatedBody } = adminUpdateSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email } = validatedBody;

    if (email && email !== adminToUpdate.email) {
      const emailConflict = await findAdminByEmail(email);
      if (emailConflict) {
        return res
          .status(RESPONSE_CODES.BAD_REQUEST)
          .json(generateBadRequest(ERROR_CODES.EMAIL_ALREADY_EXISTS));
      }
    }

    await updateAdmin(validatedBody, id, adminId);

    const { dataValues: adminData } = await findAdminById(id);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.ADMIN_UPDATE_SUCCESS, adminData));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id: superAdminId } = req.me;

    const { error: errorId, value: validatedParams } = idSchema.validate(
      req.params
    );

    if (errorId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const { id } = validatedParams;

    if (id === superAdminId) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.CANNOT_DELETE_SELF));
    }

    const adminToDelete = await findAdminById(id);

    if (!adminToDelete || adminToDelete.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    await removeAdmin(id, superAdminId);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.ADMIN_DELETE_SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const listAdmins = async (req, res) => {
  try {
    const { error, value: validatedBody } = skipLimitSearchSchema.validate(
      req.query
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { count, rows: admins } = await findAllAdmins(validatedBody);

    return res
      .status(RESPONSE_CODES.OK)
      .json(
        generateOkResponse(SUCCESS_CODES.ADMIN_LIST_SUCCESS, { count, admins })
      );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const generateQRCode = async (req, res) => {
  try {
    const { id: adminId, email } = req.me;

    const secret = SPEAKEASY.generateSecret({
      name: `Medico - Admin (${email})`,
    });

    await updateTwoFASecretAdmin(encryptData(secret.base32), adminId);

    // Generate QR Code
    QR_CODE.toDataURL(secret.otpauth_url, (error, imageUrl) => {
      if (error) {
        return res
          .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
          .json(generateUnhandledError(error));
      }
      return res.status(RESPONSE_CODES.OK).json(
        generateOkResponse(SUCCESS_CODES.QR_CODE_GENERATED_SUCCESS, {
          qrCode: imageUrl,
        })
      );
    });
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const verify2FA = async (req, res) => {
  try {
    const { error, value: validatedBody } = verifyOTPSchema.validate(req.body);

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, password, otp } = validatedBody;

    const adminToUpdate = await findAdminByEmail(email);

    if (!adminToUpdate || adminToUpdate.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    const checkPassword = await comparePassword(
      adminToUpdate.password,
      password
    );

    if (!checkPassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_PASSWORD));
    }

    const isValidOTP = await verifyOTP(
      otp,
      decryptData(adminToUpdate.twoFASecret)
    );

    if (!isValidOTP) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_OTP));
    }

    await updateSession2FA(adminToUpdate.id, true, true);

    const jwtToken = generateJwtToken(adminToUpdate.id);

    await updateAdminAuthToken(jwtToken, adminToUpdate.id);

    const updatedAdmin = await findAdminById(adminToUpdate.id);

    return res.status(RESPONSE_CODES.OK).json(
      generateOkResponse(SUCCESS_CODES.LOGIN_SUCCESS, {
        authToken: jwtToken,
        ...updatedAdmin.get({ plain: true }),
      })
    );
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const getAdmin = async (req, res) => {
  try {
    const { id } = req.me;

    const admin = await findAdminById(id);

    if (!admin || admin.isDeleted) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_ID));
    }

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS, admin));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const enableDisable2FA = async (req, res) => {
  try {
    const { id, twoFASecret, isTwoFAEnabled } = req.me;

    const { error, value: validatedBody } = otpSchema.validate(req.body);

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { otp } = validatedBody;

    const isValidOTP = await verifyOTP(otp, decryptData(twoFASecret));

    if (!isValidOTP) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_OTP));
    }

    const newTwoFAState = !isTwoFAEnabled;

    await updateSession2FA(id, newTwoFAState, newTwoFAState);

    if (!newTwoFAState) {
      await updateTwoFASecretAdmin(null, id);
    }

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { error, value: validatedBody } = forgotPasswordSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, isResend } = validatedBody;

    const adminDetails = await findAdminByEmail(email);
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_EMAIL));
    }

    const token = UUID();
    const forgotPwdExp = Date.now() + 10 * MINUTE; // 10 minutes from now in ms

    await updateForgotPwdTokenAndExpiry(
      email,
      adminDetails.id,
      token,
      forgotPwdExp
    );

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
        }admin/reset-password?email=${encodeURIComponent(
          adminDetails.email
        )}&token=${token}`,
      },
      sendMailThroughClinic: false,
      clinicId: null,
    };

    await sendMail(mailObject);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const verifyToken = async (req, res) => {
  try {
    const { error, value: validatedBody } = verifyTokenSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, forgotPwdToken } = validatedBody;

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

    if (adminDetails.forgotPwdToken !== forgotPwdToken) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_TOKEN));
    }

    const forgotPwdTokenExpiry = adminDetails.forgotPwdTokenExpiry;
    if (forgotPwdTokenExpiry < Math.floor(Date.now() / 1000)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.TOKEN_EXPIRED));
    }

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { error, value: validatedBody } = resetPasswordSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateErrorResponseFromJoi(error));
    }

    const { email, password, forgotPwdToken } = validatedBody;

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

    if (adminDetails.forgotPwdToken !== forgotPwdToken) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.INVALID_TOKEN));
    }

    const forgotPwdTokenExpiry = adminDetails.forgotPwdTokenExpiry;
    if (forgotPwdTokenExpiry < Math.floor(Date.now() / 1000)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.TOKEN_EXPIRED));
    }

    const isSamePassword = await bcrypt.compareSync(
      password,
      adminDetails.password
    );
    if (isSamePassword) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(generateBadRequest(ERROR_CODES.SAME_PASSWORD));
    }

    const hashedPassword = await hashPassword(password);

    await updateAdminPassword(adminDetails.id, hashedPassword);

    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.SUCCESS));
  } catch (error) {
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
  generateQRCode,
  verify2FA,
  getAdmin,
  login,
  logout,
  enableDisable2FA,
  forgotPassword,
  verifyToken,
  resetPassword,
};
