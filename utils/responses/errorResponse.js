const { ERROR_CODES } = require("../../config/constants/errorCodes");
const { RESPONSE_CODES } = require("../../config/constants/responseCodes");
const { getMessages } = require("../helpers/getMessages");
const { LANGUAGE } = require("../../config/constants/language");

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

const generateBadRequest = generateErrorResponse(RESPONSE_CODES.BAD_REQUEST);

const generateForbiddenRequest = generateErrorResponse(
  RESPONSE_CODES.FORBIDDEN
);

const generateUnauthorizedRequest = generateErrorResponse(
  RESPONSE_CODES.UNAUTHORIZED
);

const generateNotFoundResponse = generateErrorResponse(
  RESPONSE_CODES.NOT_FOUND
);

const generateUnhandledError = (error, lang) => {
  console.error(error);
  const errorData = error.toString();
  return generateErrorResponse(RESPONSE_CODES.INTERNAL_SERVER_ERROR)(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    errorData,
    lang
  );
};

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
