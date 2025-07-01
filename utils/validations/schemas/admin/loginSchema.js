const { Joi } = require("../../common/joi");
const { emailSchema } = require("../common/emailSchema");
const { passwordSchema } = require("../common/passwordSchema");

const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

module.exports = { loginSchema };
