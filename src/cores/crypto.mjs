import crypto from 'crypto';
import config from '../config.mjs';

const alg = 'aes-256-cbc';
const { key, iv } = config.crypto;

const encrypt = (content) => {
  const cipher = crypto.createCipheriv(alg, key, iv);
  let encrypted = cipher.update(content, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return encrypted;
};

const decrypt = (encrypted) => {
  const decipher = crypto.createDecipheriv(alg, key, iv);
  const decrypted = decipher.update(encrypted, 'base64', 'utf8');

  return decrypted + decipher.final('utf8');
};

const safeCompare = (plainPass, encodedPass) => {
  const decodedPass = decrypt(encodedPass);

  if (decodedPass.length !== plainPass.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(plainPass), Buffer.from(decodedPass));
};

export default {
  encrypt,
  decrypt,
  safeCompare,
};
