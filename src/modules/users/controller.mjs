import jwt from 'jsonwebtoken';

import config from '../../config.mjs';
import * as core from '../../cores/index.mjs';

const fileUrl = import.meta.url;
const cruder = new core.Cruder(fileUrl);
const { crypto, logger, ApiError } = core;

const {
  secret,
  expire,
  refreshExpire,
  refreshSecret,
} = config.jwt;

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

/** TODO: fill here */

async function makeTokens(user) {
  const jwtRefreshContent = {
    u: user.id,
  };

  const jwtAuthContent = {
    u: user.id,
  };

  const authToken = jwt.sign(jwtAuthContent, secret, { expiresIn: expire });
  const refreshToken = jwt.sign(jwtRefreshContent, refreshSecret, { expiresIn: refreshExpire });

  return {
    authToken,
    refreshToken,
  };
}

async function login(data) {
  const { username, password } = data;
  const users = await cruder.list({ username });

  if (!users.length) {
    throw new ApiError(404, 'User not found!');
  }

  const user = users[0];

  if (!crypto.safeCompare(password, user.password)) {
    throw new ApiError(401, 'Invalid password!');
  }

  return makeTokens(user);
}

export default {
  create,
  read,
  update,
  del,
  list,
  login,
};
