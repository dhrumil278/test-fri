const { bcrypt } = require("../../config/constants/packages");

const comparePassword = (encryptedPassword, password) =>
  bcrypt.compare(password, encryptedPassword);

module.exports = {
  comparePassword,
};
