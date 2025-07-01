const stringSanitizer = (value) => value.trim().toUpperCase();

const trimStringSanitizer = (value) => value.trim();

const stringToIntegerSanitizer = (value) => parseInt(value);

module.exports = {
  stringSanitizer,
  trimStringSanitizer,
  stringToIntegerSanitizer,
};
