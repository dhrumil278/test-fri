const { KEYS_TO_ENCRYPT } = require("../../config/constants/constantValues");
const { Crypto } = require("../../config/constants/packages");

const encryptData = (data, encryptionKey = process.env.ENCRYPTION_KEY) =>
  Crypto.AES.encrypt(data, encryptionKey).toString();

const decryptData = (
  encryptedData,
  decryptionKey = process.env.ENCRYPTION_KEY
) => {
  if (!encryptedData) return null;
  try {
    const decryptedText = Crypto.AES.decrypt(encryptedData, decryptionKey);
    return decryptedText.toString(Crypto.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

const encryptClinicServiceData = async (details) => {
  const encryptedDetails = { ...details };

  const encryptionKey = process.env.CLINIC_SERVICE_ENCRYPTION_KEY;

  KEYS_TO_ENCRYPT.forEach((key) => {
    if (encryptedDetails[key]) {
      encryptedDetails[key] = encryptData(encryptedDetails[key], encryptionKey);
    }
  });

  return encryptedDetails;
};

const decryptClinicServiceData = (details) => {
  const decryptedDetails = { ...details };

  const decryptionKey = process.env.CLINIC_SERVICE_ENCRYPTION_KEY;

  KEYS_TO_ENCRYPT.forEach((key) => {
    if (decryptedDetails[key]) {
      decryptedDetails[key] = decryptData(decryptedDetails[key], decryptionKey);
    }
  });

  return decryptedDetails;
};

module.exports = {
  encryptData,
  decryptData,
  encryptClinicServiceData,
  decryptClinicServiceData,
};
