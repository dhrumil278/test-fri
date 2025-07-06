const jwt = require("jsonwebtoken");

const generateJwtToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET);

// Verify a JWT token and return the decoded payload or null if invalid
const verifyJwtToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  generateJwtToken,
  verifyJwtToken,
};
