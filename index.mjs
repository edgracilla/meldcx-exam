import { dirname } from 'path';
import { fileURLToPath } from 'url';

import app from './src/app.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const server = app(root);

// -- exit handler

['SIGHUP', 'SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    server.log.info(`[${signal}] Terminating process..`);

    server.close().then(() => {
      server.log.info('Server successfully closed!');
      process.exit(1);
    }, (err) => {
      server.log.error(err);
    });
  });
});

export default server;
