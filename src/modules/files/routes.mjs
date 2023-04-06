import { dirname, basename } from 'path';
import { apiResponse } from '../../cores/api-utils.mjs';

import ctl from './controller.mjs';

async function routes(fastify) {
  const resource = basename(dirname(import.meta.url));

  /** upload file */

  fastify.post(`/${resource}/upload`, async (req, reply) => {
    const data = await req.file();
    const result = await ctl.handleUpload(data, req.meta);

    return apiResponse(reply, result, 201);
  });

  /** get fle */

  fastify.get(`/${resource}/:publicKey`, async (req, reply) => {
    const { publicKey } = req.params;
    const ret = await ctl.fetchFileData(publicKey);

    // Set appropriate response headers for file download
    reply.header('Content-Disposition', `attachment; filename="${ret.fileName}"`);
    reply.type('application/octet-stream');

    return reply.send(ret.fileData);
  });

  /** delete file */

  fastify.delete(`/${resource}/:privateKey`, async (req, reply) => {
    const { privateKey } = req.params;

    const result = await ctl.del(privateKey, req.meta);
    return apiResponse(reply, result, 200);
  });
}

export default routes;
