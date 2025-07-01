const { JoiBase } = require("../../../config/constants/packages");

const Joi = JoiBase.defaults((schema) =>
  schema.options({
    abortEarly: false,
    stripUnknown: true,
  })
);

module.exports = { Joi };
