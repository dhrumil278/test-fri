const { arrayContainsSchema } = require("./arrayContainsSchema");

const enumSchema = (enumsObject) =>
  arrayContainsSchema(Object.values(enumsObject));

module.exports = { enumSchema };
