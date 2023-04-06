/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { globbySync } from 'globby';
import fastify from 'fastify';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import rateLimit from '@fastify/rate-limit';

import { logger, errHandler } from './cores/index.mjs';

import config from './config.mjs';

function app(rootPath) {
  const server = fastify({
    logger: config.env === 'test' ? false : logger,
    ajv: config.ajv,
  });

  server.register(helmet);
  server.register(formbody);
  server.register(cors, config.cors);
  server.register(rateLimit, config.rateLimit);

  // -- api loader

  server.after(async () => {
    const routes = globbySync(`${rootPath}/src/modules/*/routes.mjs`);

    for (const routePath of routes) {
      server.register(await import(routePath));
    }

    server.setErrorHandler(errHandler);
  });

  // -- app init

  if (config.env !== 'test') {
    server.ready(async (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      } else {
        server.listen({ port: config.port });
      }
    });
  }

  return server;
}

export default app;
