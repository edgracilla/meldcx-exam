import { dirname, basename } from 'path';
import { apiResponse } from '../../cores/index.mjs';

import ctl from './controller.mjs';
import vld from './validation.mjs';

async function routes(fastify) {
  const resource = basename(dirname(import.meta.url));

  /** auth route */

  fastify.post(`/${resource}`, vld.postSchema, async (req, reply) => {
    const result = await ctl.authenticate(req.body);

    return apiResponse(reply, result, 200);
  });
}

export default routes;
