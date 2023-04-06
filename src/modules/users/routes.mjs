import { dirname, basename } from 'path';
import { apiResponse } from '../../cores/api-utils.mjs';

import ctl from './controller.mjs';
import vld from './validation.mjs';

async function routes(fastify) {
  const resource = basename(dirname(import.meta.url));

  /** create */

  fastify.post(`/${resource}`, vld.postSchema, async (req, reply) => {
    const { body, meta } = req;
    const result = await ctl.create(body, meta);

    return apiResponse(reply, result, 201);
  });

  /** read */

  fastify.get(`/${resource}/:id`, async (req, reply) => {
    const { params } = req;
    const result = await ctl.read(params.id);

    return apiResponse(reply, result);
  });

  /** update */

  fastify.patch(`/${resource}/:id`, vld.patchSchema, async (req, reply) => {
    const { params, body, meta } = req;
    const result = await ctl.update(params.id, body, meta);

    return apiResponse(reply, result);
  });

  /** delete */

  fastify.delete(`/${resource}/:id`, async (req, reply) => {
    const { params, meta } = req;

    const result = await ctl.del(params.id, meta);
    return apiResponse(reply, result, 204);
  });

  /** list */

  fastify.get(`/${resource}`, vld.getSchema, async (req, reply) => {
    const { query, meta } = req;
    const result = await ctl.list(query, meta);

    return apiResponse(reply, result);
  });
}

export default routes;
