const { Joi } = require("../../common/joi");

const arrayContainsSchema = (values) => Joi.string().valid(...values);

module.exports = {
  arrayContainsSchema,
};
