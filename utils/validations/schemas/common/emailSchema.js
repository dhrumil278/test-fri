const { stringSchema } = require("./baseSchemas");

const emailSchema = stringSchema.email({
  minDomainSegments: 2,
  tlds: { allow: ["com", "net"] },
});

module.exports = { emailSchema };
