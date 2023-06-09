/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import fs from 'fs';
import fastify from 'fastify';
import { globbySync } from 'globby';
import { pathToFileURL } from 'url';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import auth from './auth.mjs';
import config from './config.mjs';
import cleaner from './modules/cleanup/controller.mjs';
import { logger, errHandler } from './cores/index.mjs';

function app(rootPath) {
  const server = fastify({
    logger: config.env === 'test' ? false : logger,
    ajv: config.ajv,
  });

  server.register(helmet);
  server.register(formbody);
  server.register(cors, config.cors);
  server.register(rateLimit, config.rateLimit);
  server.register(multipart, config.multipart);

  // API modules loader

  server.after(async () => {
    const routes = globbySync(`${rootPath}/src/modules/*/routes.mjs`.replace(/\\/g, '/'));

    for (const routePath of routes) {
      const fileUrl = pathToFileURL(routePath).href;
      server.register(await import(fileUrl));
    }

    server.decorateRequest('meta', null);
    server.addHook('preValidation', auth(server));
    server.setErrorHandler(errHandler);
  });

  // Create upload folder if not exist
  if (!fs.existsSync(config.uploads)) {
    fs.mkdirSync(config.uploads);
  }

  // App init

  if (config.env !== 'test') {
    server.ready(async (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      } else {
        cleaner.fileCleanupJob();
        server.listen({ port: config.port });
      }
    });
  }

  return server;
}

export default app;
