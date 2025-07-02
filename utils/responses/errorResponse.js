// Utility functions for generating standardized error responses
const { ERROR_CODES } = require("../../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../../config/constants/responseCodes");
const { getMessages } = require("../helpers/getMessages");
const { LANGUAGE } = require("../../config/constants/language");

// Factory to generate error response objects for a given status code
const generateErrorResponse =
  (statusCode) =>
  (messageKey, errorData = {}, lang = LANGUAGE.English) => {
    const message = getMessages(messageKey, lang);
    return {
      status: statusCode,
      data: {},
      message,
      errorData,
      isError: true,
    };
  };

// Generate a 400 Bad Request error response
const generateBadRequest = generateErrorResponse(RESPONSE_CODES.BAD_REQUEST);

// Generate a 403 Forbidden error response
const generateForbiddenRequest = generateErrorResponse(
  RESPONSE_CODES.FORBIDDEN
);

// Generate a 401 Unauthorized error response
const generateUnauthorizedRequest = generateErrorResponse(
  RESPONSE_CODES.UNAUTHORIZED
);

// Generate a 404 Not Found error response
const generateNotFoundResponse = generateErrorResponse(
  RESPONSE_CODES.NOT_FOUND
);

// Generate a 500 Internal Server Error response, logging the error
const generateUnhandledError = (error, lang) => {
  console.error(error);
  const errorData = error.toString();
  return generateErrorResponse(RESPONSE_CODES.INTERNAL_SERVER_ERROR)(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    errorData,
    lang
  );
};

// Generate a 400 Bad Request error response from Joi validation errors
const generateErrorResponseFromJoi = (error, lang = LANGUAGE.English) => {
  const errorData = error.details.reduce((acc, { message, path }) => {
    const updatedMessage = message.replaceAll('"', "");
    const errorKey = path[0];
    return {
      ...acc,
      [errorKey]: [...(acc[errorKey] || []), updatedMessage],
    };
  }, {});
  const message = getMessages(ERROR_CODES.VALIDATION_ERROR, lang);
  return {
    status: RESPONSE_CODES.BAD_REQUEST,
    data: {},
    message,
    errorData,
    isError: true,
  };
};

module.exports = {
  generateBadRequest,
  generateUnauthorizedRequest,
  generateUnhandledError,
  generateErrorResponseFromJoi,
  generateNotFoundResponse,
  generateForbiddenRequest,
};
