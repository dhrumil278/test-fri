// Middleware to authenticate and authorize super admin users
const { ADMIN_ROLE } = require("../config/constants/constantValues");
const { ERROR_CODES } = require("../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../config/constants/responseCodes");
const {
  findAdminByIdWithSensitiveDetails,
} = require("../services/adminService");
const { verifyJwtToken } = require("../utils/helpers/jwtHelper");
const {
  generateForbiddenRequest,
  generateUnauthorizedRequest,
} = require("../utils/responses/errorResponse");

// Middleware function to check admin has an admin role or not
const hasAdminRole = async (req, res, next) => {
  try {
    if (req?.me?.role !== ADMIN_ROLE.ADMIN) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_ADMIN));
    }

    next();
  } catch (error) {
    console.log("error: ", error);
    return res
      .status(RESPONSE_CODES.FORBIDDEN)
      .json(generateForbiddenRequest(ERROR_CODES.INVALID_TOKEN));
  }
};

module.exports = hasAdminRole;
