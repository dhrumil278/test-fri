const { bcrypt } = require("../../config/constants/packages");

const comparePassword = (encryptedPassword, password) =>
  bcrypt.compare(password, encryptedPassword);

const hashPassword = (password) => bcrypt.hash(password, 10);

module.exports = {
  comparePassword,
  hashPassword,
};
