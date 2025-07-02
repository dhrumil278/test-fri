const { Joi } = require("../../common/joi");
const { emailSchema, booleanSchema } = require("./baseSchemas");
const { passwordSchema } = require("./passwordSchema");
const { uuidSchema } = require("./uuidSchema");

const forgotPasswordSchema = Joi.object({
  email: emailSchema.required(),
  isResend: booleanSchema.required().default(false),
});

const verifyTokenSchema = Joi.object({
  email: emailSchema.required(),
  forgotPwdToken: uuidSchema.required(),
});

const resetPasswordSchema = verifyTokenSchema.keys({
  password: passwordSchema.required(),
});

module.exports = {
  forgotPasswordSchema,
  verifyTokenSchema,
  resetPasswordSchema,
};
