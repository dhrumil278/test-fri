const Admin = require("../models/admin");

const findAdminByEmail = (email) =>
  Admin.findOne({
    where: {
      email,
      isActive: true,
      isDeleted: false,
    },
  });

const updateAdminAuthToken = (authToken, userId) =>
  Admin.update(
    { authToken },
    {
      where: { id: userId },
    }
  );

module.exports = {
  findAdminByEmail,
  updateAdminAuthToken,
};
