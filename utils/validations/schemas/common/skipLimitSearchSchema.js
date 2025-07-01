const { FIELDS } = require("../../../../config/constants/fields");
const { stringSanitizer } = require("../../../sanitizers/stringSanitizers");
const { Joi } = require("../../common/joi");
const {
  stringSchema,
  booleanSchema,
  numberSchema,
} = require("../common/baseSchemas");

const skipLimitSearchSchema = Joi.object({
  skip: numberSchema.optional(),
  limit: numberSchema.optional(),
  search: stringSchema.custom(stringSanitizer).optional(),
  isActive: booleanSchema.optional(),
  sortBy: stringSchema.default(FIELDS.CREATED_AT),
  sortType: stringSchema.valid(FIELDS.ASC, FIELDS.DESC).default(FIELDS.DESC),
});

const skipLimitSchema = Joi.object({
  skip: numberSchema.optional(),
  limit: numberSchema.optional(),
  search: stringSchema.custom(stringSanitizer).optional(),
});

module.exports = {
  skipLimitSearchSchema,
  skipLimitSchema,
};
