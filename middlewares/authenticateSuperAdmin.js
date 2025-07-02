// Middleware to authenticate and authorize super admin users
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

// Middleware function to check super admin authentication and status
const superAdminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // Check if the authorization header is present and valid
    if (!token && !token.startsWith("Bearer ")) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.TOKEN_IS_REQUIRED));
    }

    // Extract JWT token from header
    const authToken = token.split("Bearer ")[1];
    const decodedToken = verifyJwtToken(authToken);

    // Validate the JWT token
    if (!decodedToken) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.INVALID_TOKEN));
    }

    // Fetch admin details using decoded token
    const { dataValues: adminDetails } =
      await findAdminByIdWithSensitiveDetails(decodedToken.id);

    // Check if admin exists
    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_USER));
    }

    // Ensure the token matches the stored authToken
    if (adminDetails.authToken !== authToken) {
      return res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          generateUnauthorizedRequest(ERROR_CODES.YOU_HAVE_BEEN_LOGGED_OUT)
        );
    }

    // Check if admin is deleted
    if (adminDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_DELETED));
    }

    // Check if admin is active
    if (!adminDetails.isActive) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_ACTIVE));
    }

    // Log the IP address of the admin making the request
    const ip = req?.headers["x-forwarded-for"] || req?.connection.remoteAddress;
    console.log(
      `${adminDetails.firstName} ${adminDetails.lastName} IP accessed: ${ip}`
    );

    // Attach admin details to request object for downstream use
    req.me = adminDetails;
    next();
  } catch (error) {
    console.log("error: ", error);
    return res
      .status(RESPONSE_CODES.FORBIDDEN)
      .json(generateForbiddenRequest(ERROR_CODES.INVALID_TOKEN));
  }
};

module.exports = superAdminMiddleware;
