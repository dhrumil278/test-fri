const { ERROR_CODES } = require("../../../config/constants/errorCodes");
const { NODEMAILER } = require("../../../config/constants/packages");
const { getTemplate } = require("./prepareTemplate");

const sendMail = async (mailObject) => {
  try {
    const {
      mailTo,
      mailsCC,
      mailSubject,
      templateName,
      templatePayload,
      bodyText,
      attachments,
    } = mailObject;

    let mailBody;

    let createTransportObject = {};
    let from = "";

    createTransportObject = {
      host: process.env.GMAIL_HOST,
      port: process.env.GMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.ETHEREAL_USERNAME,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    };
    from = {
      name: "Medical Insurance",
      address: process.env.GMAIL,
    };

    const smtpTransport = NODEMAILER.createTransport(createTransportObject);

    if (templateName) {
      mailBody = getTemplate(templateName, templatePayload);

      if (mailBody.isError) {
        return mailBody;
      }
    }

    const mailOptions = {
      to: mailTo,
      from: from,
      subject: mailSubject,
      ...(bodyText && { text: bodyText }),
      ...(mailBody && { html: mailBody.htmlToSend }),
      cc: mailsCC,
      ...(attachments && { attachments }),
    };
    await smtpTransport.sendMail(mailOptions);
    return {
      isError: false,
    };
  } catch (err) {
    console.log("Error while sending mail, err: ", err);
    return {
      isError: true,
      errorCode: ERROR_CODES.ERROR_IN_SEND_MAIL,
    };
  }
};

module.exports = {
  sendMail,
};
