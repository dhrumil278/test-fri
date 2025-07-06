const { FIELDS } = require("../../../../config/constants/fields");
const {
  stringSanitizer,
  stringSanitizerToUpper,
  stringSanitizerToLower,
} = require("../../../sanitizers/stringSanitizers");
const { Joi } = require("../../common/joi");
const { uuidSchema } = require("./uuidSchema");

const numberSchema = Joi.number();

const stringSchema = Joi.string();

const booleanSchema = Joi.boolean();

const emailSchema = stringSchema
  .email({
    minDomainSegments: 2,
  })
  .custom(stringSanitizerToLower);

const optionalEmailSchema = emailSchema
  .empty(FIELDS.JOI_EMPTY_ARRAY)
  .optional()
  .default(null);

const isoDateSchema = Joi.date()
  .iso()
  .empty(FIELDS.JOI_EMPTY_ARRAY)
  .optional()
  .default(null)
  .custom((value, helpers) => {
    if (!value) return value;
    return new Date(value).toISOString();
  });

const phoneFaxSchema = stringSchema
  .empty(FIELDS.JOI_EMPTY_ARRAY)
  .custom((value, helpers) => {
    if (!value) return value;

    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly.length !== 10) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .optional()
  .default(null);

const capRequiredStringSchema = stringSchema
  .custom(stringSanitizerToUpper)
  .required();

const capOptionalStringSchema = ({
  defaultValue = null,
  max = null,
  min = null,
} = {}) => {
  let schema = stringSchema
    .custom(stringSanitizer)
    .empty(FIELDS.JOI_EMPTY_ARRAY);

  if (min != null) {
    schema = schema.min(min);
  }
  if (max !== null) {
    schema = schema.max(max);
  }

  schema = schema.optional().default(defaultValue);
  return schema;
};

const requiredStringSchema = stringSchema.required();
const optionalStringSchema = ({
  defaultValue = null,
  max = null,
  min = null,
} = {}) => {
  let schema = stringSchema.empty(FIELDS.JOI_EMPTY_ARRAY);

  if (min != null) {
    schema = schema.min(min);
  }
  if (max !== null) {
    schema = schema.max(max);
  }

  schema = schema.optional().default(defaultValue);
  return schema;
};
const buildValidStringSchema = ({
  validValues = [],
  required = false,
  defaultValue = null,
} = {}) => {
  let schema = Joi.string()
    .valid(...validValues)
    .empty(FIELDS.JOI_EMPTY_ARRAY);

  if (required) {
    schema = schema.required();
  } else {
    schema = schema.optional().default(defaultValue);
  }

  return schema;
};

const uuidSchemaOptional = uuidSchema
  .empty(FIELDS.JOI_EMPTY_ARRAY)
  .optional()
  .default(null);

const numberSchemaOptional = ({
  defaultValue = null,
  min = null,
  max = null,
} = {}) => {
  let schema = numberSchema.empty(FIELDS.JOI_EMPTY_ARRAY);

  if (min != null) {
    schema = schema.min(min);
  }
  if (max !== null) {
    schema = schema.max(max);
  }
  schema.optional().default(defaultValue);

  return schema;
};

module.exports = {
  numberSchema,
  stringSchema,
  booleanSchema,
  emailSchema,
  optionalEmailSchema,
  isoDateSchema,
  phoneFaxSchema,
  capRequiredStringSchema,
  capOptionalStringSchema,
  requiredStringSchema,
  optionalStringSchema,
  buildValidStringSchema,
  uuidSchemaOptional,
  numberSchemaOptional,
};
