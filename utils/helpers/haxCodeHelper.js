// Helper function to generate unique haxCode for referral links
const { UUID, Crypto } = require("../../config/constants/packages");

// Generate a unique haxCode for referral links
function encryptUUID() {
  const uuid = UUID(); // Generate a random UUID
  return Crypto.AES.encrypt(uuid, process.env.ENCRYPTION_KEY).toString();
}

module.exports = {
  encryptUUID,
};
