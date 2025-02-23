const crypto = require("crypto");

// Load the encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("Invalid or missing ENCRYPTION_KEY environment variable");
}
const IV_LENGTH = 16; // AES block size

// Encryption function
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH); // Random initialization vector
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decryption function
function decrypt(text) {
  try {
    if (!text || !text.includes(":")) {
      throw new Error("Invalid encrypted text format");
    }
    const [ivHex, encryptedHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error.message);
    throw error;
  }
}



module.exports = {
  encrypt,
  decrypt,
};
