// Utility functions for generating standardized success responses
const { LANGUAGE } = require("../../config/constants/language");
const { Crypto } = require("../../config/constants/packages");
const { RESPONSE_CODES } = require("../../config/constants/responseCodes");
const {
  SUCCESS_CODES: { EMPTY_STRING },
} = require("../../config/constants/successCodes");
const { getMessages } = require("../helpers/getMessages");

// Factory to generate success response objects for a given status code
const generateSuccessResponse =
  (statusCode) =>
  (messageKey, data = {}, lang = LANGUAGE.English) => {
    // Encrypt response data if present
    const cipherText =
      Object.keys(data).length > 0
        ? Crypto.AES.encrypt(
            JSON.stringify(data),
            process.env.ENCRYPTION_KEY
          ).toString()
        : {};

    return {
      status: statusCode,
      data: cipherText,
      message: getMessages(messageKey, lang) || EMPTY_STRING,
      errorData: {},
      isError: false,
    };
  };

// Generate a 200 OK success response
const generateOkResponse = generateSuccessResponse(RESPONSE_CODES.OK);

module.exports = {
  generateOkResponse,
};
