const { FIELDS } = require("../../../../config/constants/fields");
const { stringSanitizer } = require("../../../sanitizers/stringSanitizers");
const { Joi } = require("../../common/joi");
const {
  stringSchema,
  booleanSchema,
  numberSchema,
} = require("../common/baseSchemas");

const skipLimitSearchSchemaObj = {
  skip: numberSchema.optional(),
  limit: numberSchema.optional(),
  search: stringSchema.custom(stringSanitizer).optional(),
  isActive: booleanSchema.optional(),
  sortBy: stringSchema.default(FIELDS.CREATED_AT),
  sortType: stringSchema.valid(FIELDS.ASC, FIELDS.DESC).default(FIELDS.DESC),
};

const skipLimitSearchSchema = Joi.object(skipLimitSearchSchemaObj);

const skipLimitSchema = Joi.object({
  skip: skipLimitSearchSchemaObj.skip,
  limit: skipLimitSearchSchemaObj.limit,
  search: skipLimitSearchSchemaObj.search,
});

module.exports = {
  skipLimitSearchSchema,
  skipLimitSchema,
  skipLimitSearchSchemaObj,
};
