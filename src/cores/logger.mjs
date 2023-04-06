import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { translateTime: true },
  },
});

export default logger;
