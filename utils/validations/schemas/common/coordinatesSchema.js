const { floatSanitizer } = require("../../../sanitizers/floatSanitizer");
const { Joi } = require("../../common/joi");

const COORDINATES_LENGTH = 2;

const NINETY_DEGREES = 90;
const ONE_EIGHTY_DEGREES = 180;
const COORDINATE_PRECISION = 8;

const longitudeSchema = floatSanitizer(
  -ONE_EIGHTY_DEGREES,
  ONE_EIGHTY_DEGREES,
  COORDINATE_PRECISION
);

const latitudeSchema = floatSanitizer(
  -NINETY_DEGREES,
  NINETY_DEGREES,
  COORDINATE_PRECISION
);

// TODO: when the interface changes, we could use number with min, max and precision
const coordinatesSchema = Joi.array()
  .ordered(longitudeSchema, latitudeSchema)
  .length(COORDINATES_LENGTH);

module.exports = { coordinatesSchema, latitudeSchema, longitudeSchema };
