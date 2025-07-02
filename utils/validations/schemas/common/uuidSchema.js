const { UuidVersions } = require("../../../../config/constants/uuidVersions");
const { Joi } = require("../../common/joi");

const uuidSchema = Joi.string().guid({
  version: [UuidVersions.v1, UuidVersions.v4],
});

module.exports = { uuidSchema };
