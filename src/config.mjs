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
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
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
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '30m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '1d',
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
