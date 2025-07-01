const {
  UuidVersions,
} = require("../../../../../config/constants/uuidVersions");
const { stringSchema } = require("./baseSchemas");

const uuidSchema = stringSchema.guid({
  version: [UuidVersions.v1, UuidVersions.v4],
});

module.exports = { uuidSchema };
