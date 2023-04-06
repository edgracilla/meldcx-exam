import Ajv from 'ajv';
import dotenv from 'dotenv';

dotenv.config();

const ajv = new Ajv({ allErrors: true });
const port = +(process.env.PORT || 8080);
const env = process.env.NODE_ENV || 'development';

const validate = ajv.compile({
  type: 'object',
  required: [
    'PORT',
    'USER_PASS_KEY',
    'USER_PASS_IV',
  ],
});

if (!validate(process.env)) {
  throw validate.errors;
}

export default {
  env,
  port,

  crypto: {
    iv: process.env.USER_PASS_IV,
    key: process.env.USER_PASS_KEY,
  },

  // -- fastify scpecific

  cors: {
    origin: '*',
  },
  ajv: {
    customOptions: {
      allErrors: true,
      keywords: ['prereq'],
    },
  },
  rateLimit: {
    max: 100,
    addHeaders: {
      'retry-after': false,
      'x-ratelimit-limit': false,
      'x-ratelimit-reset': false,
      'x-ratelimit-remaining': false,
    },
    addHeadersOnExceeding: {
      'x-ratelimit-limit': false,
      'x-ratelimit-reset': false,
      'x-ratelimit-remaining': false,
    },
  },
  rateLimitMax404: 50,
};
