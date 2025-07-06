const DEFAULT_EXAM_TIME = 25;

const DEFAULT_TIME_ZONE = "America/Chicago";

const KEYS_TO_ENCRYPT = [
  "password",
  "apiKey",
  "authToken",
  "clientSecret",
  "jwtToken",
];

const ADMIN_ROLE = {
  COUNSELOR: "COUNSELOR",
  ADMIN: "ADMIN",
  FINANCIER: "FINANCIER",
};
const USER_ROLE = {
  BRANCH: "BRANCH",
  DISTRIBUTOR: "DISTRIBUTOR",
  FRANCHISE: "FRANCHISE",
};

module.exports = {
  DEFAULT_EXAM_TIME,
  DEFAULT_TIME_ZONE,
  KEYS_TO_ENCRYPT,
  ADMIN_ROLE,
  USER_ROLE,
};
