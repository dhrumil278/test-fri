const { Joi } = require("../../common/joi");
const { passwordSchema } = require("../common/passwordSchema");
const { emailSchema } = require("./baseSchemas");

const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

module.exports = { loginSchema };
