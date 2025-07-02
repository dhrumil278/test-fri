const { Joi } = require("../../common/joi");

const otpSchema = Joi.object({
  otp: Joi.string().required(),
});

module.exports = { otpSchema };
