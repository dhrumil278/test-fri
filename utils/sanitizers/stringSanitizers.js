const stringSanitizerToUpper = (value) => value.trim().toUpperCase();
const stringSanitizer = (value) => value.trim();
const stringSanitizerToLower = (value) => value.trim().toLowerCase();

const trimStringSanitizer = (value) => value.trim();

const stringToIntegerSanitizer = (value) => parseInt(value);

module.exports = {
  stringSanitizer,
  trimStringSanitizer,
  stringToIntegerSanitizer,
  stringSanitizerToLower,
  stringSanitizerToUpper,
};
