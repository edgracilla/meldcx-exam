import * as core from '../../cores/index.mjs';

const fileUrl = import.meta.url;
const cruder = new core.Cruder(fileUrl);
const { crypto, logger, ApiError } = core;

/** create */

async function create(data) {
  const { username, password } = data;

  const user = cruder.list({ username });

  if (user.length) {
    throw new ApiError(400, 'Username already exist!');
  }

  const ret = cruder.insert({
    ...data,
    password: crypto.encrypt(password),
  });

  return ret;
}

/** read */

async function read(id) {
  const user = cruder.read(id);

  // TODO: for debugging purposes only
  logger.info(`Password: ${crypto.decrypt(user.password)}`);

  return user;
}

/** update */

async function update(id, data) {
  return cruder.update(id, data);
}

/** delete */

async function del(id) {
  return cruder.del(id);
}

/** list */

async function list(filter) {
  return cruder.list(filter);
}

export default {
  create,
  read,
  update,
  del,
  list,
};
