// Health check controller to verify server status
const { RESPONSE_CODES } = require("../config/constants/responseCodes");
const { SUCCESS_CODES } = require("../config/constants/successCodes");
const { generateUnhandledError } = require("../utils/responses/errorResponse");
const { generateOkResponse } = require("../utils/responses/successResponse");

// Health check endpoint handler
const hc = (req, res) => {
  try {
    // Respond with a success code for health check
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.HEALTH_CHECK));
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};

module.exports = {
  hc,
};
