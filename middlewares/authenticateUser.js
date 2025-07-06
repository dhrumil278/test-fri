// Middleware to authenticate and authorize branch users
const { ERROR_CODES } = require("../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../config/constants/responseCodes");
const {
  findBranchByIdWithSensitiveDetails,
} = require("../services/branchService");
const { verifyJwtToken } = require("../utils/helpers/jwtHelper");
const {
  generateForbiddenRequest,
  generateUnauthorizedRequest,
} = require("../utils/responses/errorResponse");

// Middleware function to check branch authentication and status
const userMiddleware = async (req, res, next) => {
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

    // Fetch branch details using decoded token
    const { dataValues: branchDetails } =
      await findBranchByIdWithSensitiveDetails(decodedToken.id);

    // Check if branch exists
    if (!branchDetails) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_USER));
    }

    // Ensure the token matches the stored authToken
    if (branchDetails.authToken !== authToken) {
      return res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          generateUnauthorizedRequest(ERROR_CODES.YOU_HAVE_BEEN_LOGGED_OUT)
        );
    }

    // Check if branch is deleted
    if (branchDetails.isDeleted) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_DELETED));
    }

    // Check if branch is active
    if (!branchDetails.isActive) {
      return res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(generateForbiddenRequest(ERROR_CODES.YOU_ARE_NOT_ACTIVE));
    }

    // Log the IP address of the branch making the request
    const ip = req?.headers["x-forwarded-for"] || req?.connection.remoteAddress;
    console.log(
      `${branchDetails.firstName} ${branchDetails.lastName} IP accessed: ${ip}`
    );

    // Attach branch details to request object for downstream use
    req.me = branchDetails;
    next();
  } catch (error) {
    console.log("error: ", error);
    return res
      .status(RESPONSE_CODES.FORBIDDEN)
      .json(generateForbiddenRequest(ERROR_CODES.INVALID_TOKEN));
  }
};

module.exports = userMiddleware;
