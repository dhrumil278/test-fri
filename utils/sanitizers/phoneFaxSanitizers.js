const faxSanitizer = (fax) => {
  if (fax) {
    return fax
      .replaceAll("-", "")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll(" ", "");
  }
  return null;
};
const phoneSanitizer = (phone) => {
  if (phone) {
    return phone
      .replaceAll("-", "")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll(" ", "");
  }
  return null;
};
module.exports = {
  faxSanitizer,
  phoneSanitizer,
};
