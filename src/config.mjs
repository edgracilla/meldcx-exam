import Ajv from 'ajv';
import dotenv from 'dotenv';

dotenv.config();

const ajv = new Ajv({ allErrors: true });
const port = +(process.env.PORT || 8080);
const env = process.env.NODE_ENV || 'development';

const validate = ajv.compile({
  type: 'object',
  required: [
    'MONGO_URL',
    'MONGO_DB_NAME',
  ],
});

if (!validate(process.env)) {
  throw validate.errors;
}

export default {
  env,
  port,

  // -- dependencies

  mongoDb: {
    type: process.env.MONGO_TYPE,
    dbURL: process.env.MONGO_URL,
    sslCA: process.env.MONGO_SSL_CA,
    recordset: process.env.MONGO_RS,
    dbName: process.env.MONGO_DB_NAME,
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
