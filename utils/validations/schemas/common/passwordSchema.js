const { stringSchema } = require("./baseSchemas");

const passwordSchema = stringSchema.pattern(
  new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$*!])[a-zA-Z0-9@#$*!]{3,30}$"
  )
);

module.exports = { passwordSchema };
