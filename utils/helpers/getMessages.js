module.exports.getMessages = function (key, lang) {
  const localeFilePath = `../../config/constants/lang/${lang}.json`;
  const messages = require(localeFilePath);
  return messages[key];
};
