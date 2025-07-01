const { RESPONSE_CODES } = require("../config/constants/responseCodes");
const { SUCCESS_CODES } = require("../config/constants/successCodes");
const { generateUnhandledError } = require("../utils/responses/errorResponse");
const { generateOkResponse } = require("../utils/responses/successResponse");

const hc = (req, res) => {
  try {
    return res
      .status(RESPONSE_CODES.OK)
      .json(generateOkResponse(SUCCESS_CODES.HEALTH_CHECK));
  } catch (error) {
    return res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(generateUnhandledError(error));
  }
};
module.exports = {
  hc,
};
