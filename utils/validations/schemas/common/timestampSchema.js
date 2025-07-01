const { Joi } = require("../../common/joi");

const JAVASCRIPT_TIMESTAMP = "javascript";

const timestampSchema = Joi.date().timestamp(JAVASCRIPT_TIMESTAMP).raw();

module.exports = { timestampSchema };
