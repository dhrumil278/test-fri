const MAIL_TYPES = {
  CREDENTIAL_MAIL: "creds-mail",
  FORGOT_PASSWORD: "forgot-password",
  RESEND_FORGOT_PASSWORD: "resend-forgot-password",
  BRANCH_CREDENTIAL_MAIL: "branch-creds-mail",
  USER_FORGOT_PASSWORD: "user-forgot-password",
  USER_RESEND_FORGOT_PASSWORD: "user-resend-forgot-password",
};

const MAIL_SUBJECTS = {
  CREDENTIAL_MAIL_SUBJECT: "Get Started with Wealth Train - Your Login Details",
  FORGOT_PASSWORD_MAIL_SUBJECT: "Reset Your Password",
  RESEND_FORGOT_PASSWORD_MAIL_SUBJECT: "Resend - Reset Your Password",
  BRANCH_CREDENTIAL_MAIL_SUBJECT:
    "Welcome to Wealth Train - Your Branch Login Details",
  USER_FORGOT_PASSWORD_MAIL_SUBJECT: "Reset Your User Password",
  USER_RESEND_FORGOT_PASSWORD_MAIL_SUBJECT: "Resend - Reset Your User Password",
};

module.exports = {
  MAIL_TYPES,
  MAIL_SUBJECTS,
};
