const { Joi } = require("../../common/joi");
const { passwordSchema } = require("./passwordSchema");

const changePasswordSchema = Joi.object({
  currentPassword: passwordSchema.required(),
  newPassword: passwordSchema.required(),
});

module.exports = { changePasswordSchema };
