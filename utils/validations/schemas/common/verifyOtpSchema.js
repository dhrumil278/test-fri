const { Joi } = require("../../common/joi");
const { emailSchema } = require("./baseSchemas");
const { passwordSchema } = require("./passwordSchema");

const verifyOTPSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
  otp: Joi.string().required(),
});

module.exports = { verifyOTPSchema };
