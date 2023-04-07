import Ajv from 'ajv';
import dotenv from 'dotenv';

dotenv.config();

const ajv = new Ajv({ allErrors: true });
const env = process.env.NODE_ENV || 'development';
const uploads = process.env.FOLDER || './uploads';
const cronSched = process.env.SCHED_CLEANUP || '0 0 * * *';

const port = +process.env.PORT || 8080;
const fileTTL = +process.env.FILE_DAYS_TTL || 5;
const reqPerDay = +process.env.REQ_PER_DAY || 100;
const idAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

const validate = ajv.compile({
  type: 'object',
  required: [
    'PORT',
    'FOLDER',
    'CONFIG',
    'PROVIDER',

    'JWT_SECRET',
    'USER_PASS_IV',
    'USER_PASS_KEY',
  ],
});

if (!validate(process.env)) {
  throw validate.errors;
}

export default {
  env,
  port,
  uploads,
  fileTTL,
  cronSched,
  idAlphabet,
  provider: process.env.PROVIDER,
  providerConf: process.env.CONFIG,
  cors: {
    origin: '*',
  },
  crypto: {
    iv: process.env.USER_PASS_IV,
    key: process.env.USER_PASS_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '1h',
  },
  ajv: {
    customOptions: {
      allErrors: true,
    },
  },
  multipart: {
    files: 1, // Max number of file fields
  },
  rateLimit: {
    max: reqPerDay,
    timeWindow: '1d',
  },
};
