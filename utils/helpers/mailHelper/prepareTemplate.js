// Utility for loading and compiling email templates using Handlebars
const { FIELDS } = require("../../../config/constants/fields");
const { LANGUAGE } = require("../../../config/constants/language");
const { FS, PATH, HANDLEBARS } = require("../../../config/constants/packages");
const { ERROR_CODES } = require("../../../config/constants/errorCodes");

// Base path for templates
const TEMPLATE_BASE_PATH = PATH.join(__dirname, "../../../assets/templates");

// Template cache
const templateCache = {};

// Get and render template
const getTemplate = (templateName, payload, lang = LANGUAGE.English) => {
  try {
    // Cache key
    const cacheKey = `${lang}-${templateName}`;
    // Compile and cache if not present
    if (!templateCache[cacheKey]) {
      const templateFile = FS.readFileSync(
        PATH.join(TEMPLATE_BASE_PATH, lang, `${templateName}.hbs`),
        { encoding: FIELDS.UTF8 }
      );
      templateCache[cacheKey] = HANDLEBARS.compile(templateFile);
    }
    // Render template
    const htmlToSend = templateCache[cacheKey](payload);
    return { isError: false, htmlToSend };
  } catch (error) {
    // On error
    console.log("Error while getting template : ", error);
    return {
      isError: true,
      errorCode: ERROR_CODES.ERROR_WHILE_GENERATING_TEMPLATE,
    };
  }
};

module.exports = {
  getTemplate,
};
