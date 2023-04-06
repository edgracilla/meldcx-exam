import Ajv from 'ajv';
import dotenv from 'dotenv';

dotenv.config();

const ajv = new Ajv({ allErrors: true });
const env = process.env.NODE_ENV || 'development';
const uploads = process.env.FOLDER || './uploads';
const cronSched = process.env.SCHED_CLEANUP || '0 8 * * *';

const port = +process.env.PORT || 8080;
const reqPerDay = +process.env.REQ_PER_DAY || 100;

const validate = ajv.compile({
  type: 'object',
  required: [
    'PORT',
    'FOLDER',
    'REQ_PER_DAY',
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
  uploads,
  cronSched,
  cors: {
    origin: '*',
  },
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
  ajv: {
    customOptions: {
      allErrors: true,
      keywords: ['prereq'],
    },
  },
  multipart: {
    files: 1, // Max number of file fields
  },
  rateLimit: {
    max: reqPerDay,
    timeWindow: '1d',
  },
  rateLimitMax404: 50,
};
