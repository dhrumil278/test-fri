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

const superAdminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token && !token.startsWith("Bearer ")) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.TOKEN_IS_REQUIRED));
    }

    const authToken = token.split("Bearer ")[1];
    const decodedToken = verifyJwtToken(authToken);

    if (!decodedToken) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.INVALID_TOKEN));
    }

    const { dataValues: adminDetails } =
      await findAdminByIdWithSensitiveDetails(decodedToken.id);

    if (!adminDetails) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_USER));
    }

    if (adminDetails.authToken !== authToken) {
      return res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          generateUnauthorizedRequest(ERROR_CODES.YOU_HAVE_BEEN_LOGGED_OUT)
        );
    }

    if (adminDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_DELETED));
    }

    if (!adminDetails.isActive) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_ACTIVE));
    }

    const ip = req?.headers["x-forwarded-for"] || req?.connection.remoteAddress;

    console.log(
      `${adminDetails.firstName} ${adminDetails.lastName} IP accessed: ${ip}`
    );

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
