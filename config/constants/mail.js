const MAIL_TYPES = {
  CREDENTIAL_MAIL: "creds-mail",
  FORGOT_PASSWORD: "forgot-password",
  RESEND_FORGOT_PASSWORD: "resend-forgot-password",
};

const MAIL_SUBJECTS = {
  CREDENTIAL_MAIL_SUBJECT:
    "Get Started with Medial Insurance - Your Login Details",
  FORGOT_PASSWORD_MAIL_SUBJECT: "Reset Your Password",
  RESEND_FORGOT_PASSWORD_MAIL_SUBJECT: "Resend - Reset Your Password",
};

module.exports = {
  MAIL_TYPES,
  MAIL_SUBJECTS,
};
