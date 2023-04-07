import { dirname, basename } from 'path';
import { apiResponse } from '../../cores/api-utils.mjs';

import ctl from './controller.mjs';
import vld from './validation.mjs';

async function routes(fastify) {
  const resource = basename(dirname(import.meta.url));

  // -- Signup

  fastify.post(`/${resource}/signup`, vld.postSchema, async (req, reply) => {
    const { body, meta } = req;
    const result = await ctl.create(body, meta);

    return apiResponse(reply, result, 201);
  });

  // -- Login

  fastify.post(`/${resource}/login`, vld.postSchema, async (req, reply) => {
    const result = await ctl.auth(req.body);

    return apiResponse(reply, result, 200);
  });

  // -- Get rec

  fastify.get(`/${resource}/:id`, async (req, reply) => {
    const { params } = req;
    const result = await ctl.read(params.id);

    return apiResponse(reply, result);
  });

  // -- Update

  fastify.patch(`/${resource}/:id`, vld.patchSchema, async (req, reply) => {
    const { params, body, meta } = req;
    const result = await ctl.update(params.id, body, meta);

    return apiResponse(reply, result);
  });

  // -- Delete

  fastify.delete(`/${resource}/:id`, async (req, reply) => {
    const { params, meta } = req;

    const result = await ctl.del(params.id, meta);
    return apiResponse(reply, result, 204);
  });

  // -- List rec

  fastify.get(`/${resource}`, vld.getSchema, async (req, reply) => {
    const { query, meta } = req;
    const result = await ctl.list(query, meta);

    return apiResponse(reply, result);
  });
}

export default routes;
