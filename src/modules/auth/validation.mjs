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

export default {
  body,
  postSchema: { schema: { body } },
};
