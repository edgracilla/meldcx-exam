import lodash from 'lodash';

const body = {
  type: 'object',
  required: [
    'username',
    'password',
  ],
  properties: {
    username: { type: 'string', maxLength: 100 },
    password: { type: 'string', maxLength: 100 },
  },
};

const query = {
  id: { type: 'string' },
  username: { type: 'string' },
};

export default {
  body,
  postSchema: { schema: { body } },
  getSchema: { schema: { querystring: query } },
  patchSchema: { schema: { body: lodash.pick(body, ['type', 'properties']) } },
};
