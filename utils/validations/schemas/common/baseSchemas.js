const { Joi } = require("../../common/joi");

const numberSchema = Joi.number();

const stringSchema = Joi.string();

const booleanSchema = Joi.boolean();

const emailSchema = stringSchema.email({
  minDomainSegments: 2,
  tlds: { allow: ["com"] },
});

module.exports = {
  numberSchema,
  stringSchema,
  booleanSchema,
};
