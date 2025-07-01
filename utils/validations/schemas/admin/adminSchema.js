const { Joi } = require("../../common/joi");
const {
  booleanSchema,
  capRequiredStringSchema,
} = require("../common/baseSchemas");
const { emailSchema } = require("../common/baseSchemas");
const { passwordSchema } = require("../common/passwordSchema");

const adminCreateSchema = Joi.object({
  firstName: capRequiredStringSchema,
  lastName: capRequiredStringSchema,
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

const adminUpdateSchema = Joi.object({
  firstName: capRequiredStringSchema,
  lastName: capRequiredStringSchema,
  email: emailSchema.required(),
  isActive: booleanSchema.optional().default(true),
});

module.exports = { adminCreateSchema, adminUpdateSchema };
