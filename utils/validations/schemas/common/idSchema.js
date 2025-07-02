const { Joi } = require("../../common/joi");

const { uuidSchema } = require("./uuidSchema");

const idSchema = Joi.object({
  id: uuidSchema.required(),
});

module.exports = { idSchema };
