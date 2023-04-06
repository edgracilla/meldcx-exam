/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

// import path from 'path';
// import globby from 'globby';
import fastify from 'fastify';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import rateLimit from '@fastify/rate-limit';

import { logger } from './cores/index.mjs';

import config from './config.mjs';

function app() {
  const server = fastify({
    logger: config.env === 'test' ? false : logger,
    ajv: config.ajv,
  });

  server.register(helmet);
  server.register(formbody);

  server.register(cors, config.cors);
  // server.register(mongoDb, config.mongoDb);
  server.register(rateLimit, config.rateLimit);

  server.decorate('modules', {});
  server.decorate('config', { cache: config.cache, env: config.env });

  // -- api loader

  // server.after(async () => {
  //   const versions = globby
  //     .sync(`${rootPath}/src/api/*`, { onlyDirectories: true })
  //     .map((dir) => path.basename(dir));

  //   server.setErrorHandler(errHandler);
  //   server.setNotFoundHandler({ preHandler: server.rateLimit(config.rateLimit) });

  //   for (const version of versions) {
  //     const versionPath = `${rootPath}/src/api/${version}`;
  //     const auth = (await import(`${versionPath}/auth.mjs`)).default;

  //     const models = globby.sync(`${versionPath}/modules/*/model.mjs`);
  //     const routes = globby.sync(`${versionPath}/modules/*/routes.mjs`);
  //     const zWorker = (await import(`${versionPath}/services/zmq-svc-worker.mjs`)).default;

  //     for (const modelPath of models) {
  //       (await import(modelPath)).default._init(server);
  //     }

  //     server.register(async (instance, opts, next) => {
  //       instance.decorateRequest('meta', null);
  //       instance.addHook('preValidation', auth(server));

  //       if (config.env !== 'test') {
  //         zWorker.init();

  //         instance.addHook('onClose', async () => {
  //           zWorker.stop();
  //         });
  //       }

  //       for (const routePath of routes) {
  //         instance.register(await import(routePath));
  //       }

  //       next();
  //     }, { prefix: `/${version}` });
  //   }
  // });

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
