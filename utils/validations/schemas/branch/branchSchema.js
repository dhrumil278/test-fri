const { USER_ROLE } = require("../../../../config/constants/constantValues");
const { Joi } = require("../../common/joi");
const {
  booleanSchema,
  capRequiredStringSchema,
} = require("../common/baseSchemas");
const { emailSchema } = require("../common/baseSchemas");
const { passwordSchema } = require("../common/passwordSchema");
const {
  skipLimitSearchSchema,
  skipLimitSearchSchemaObj,
} = require("../common/skipLimitSearchSchema");

const branchCreateSchema = Joi.object({
  firstName: capRequiredStringSchema,
  lastName: capRequiredStringSchema,
  email: emailSchema.required(),
  password: passwordSchema.required(),
  role: capRequiredStringSchema
    .valid(USER_ROLE.BRANCH, USER_ROLE.DISTRIBUTOR, USER_ROLE.FRANCHISE)
    .required(),
});

const branchUpdateSchema = Joi.object({
  firstName: capRequiredStringSchema,
  lastName: capRequiredStringSchema,
  email: emailSchema.required(),
  isActive: booleanSchema.optional().default(true),
});

const branchListSchema = Joi.object({
  ...skipLimitSearchSchemaObj,
  role: capRequiredStringSchema
    .valid(USER_ROLE.BRANCH, USER_ROLE.DISTRIBUTOR, USER_ROLE.FRANCHISE)
    .optional(),
});

module.exports = { branchCreateSchema, branchUpdateSchema, branchListSchema };
