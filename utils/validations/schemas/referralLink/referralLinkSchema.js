const { Joi } = require("../../common/joi");
const {
  booleanSchema,
  capRequiredStringSchema,
} = require("../common/baseSchemas");
const { idSchema } = require("../common/idSchema");
const {
  skipLimitSearchSchema,
  skipLimitSearchSchemaObj,
} = require("../common/skipLimitSearchSchema");

const referralLinkCreateSchema = Joi.object({
  name: capRequiredStringSchema,
});

const referralLinkUpdateSchema = Joi.object({
  name: capRequiredStringSchema,
  isActive: booleanSchema.optional().default(true),
});

const referralLinkListSchema = Joi.object({
  ...skipLimitSearchSchemaObj,
  userId: idSchema.optional(),
  isActive: booleanSchema.optional(),
});

const referralLinkGetByHaxCodeSchema = Joi.object({
  haxCode: capRequiredStringSchema,
});

module.exports = {
  referralLinkCreateSchema,
  referralLinkUpdateSchema,
  referralLinkListSchema,
  referralLinkGetByHaxCodeSchema,
};
