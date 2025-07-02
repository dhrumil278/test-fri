const generateJwtToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET);

module.exports = {
  generateJwtToken,
};
