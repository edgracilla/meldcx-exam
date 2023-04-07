import jwt from 'jsonwebtoken';

import config from '../../config.mjs';
import * as core from '../../cores/index.mjs';

const fileUrl = import.meta.url;
const model = new core.Cruder(fileUrl);

const { secret, expire } = config.jwt;
const { crypto, logger, ApiError } = core;

// -- Create user

function create(data) {
  const { username, password } = data;

  const user = model.list({ username });

  if (user.length) {
    throw new ApiError(400, 'Username already exist!');
  }

  const ret = model.insert({
    ...data,
    password: crypto.encrypt(password),
  });

  return ret;
}

// -- Get user

function read(id) {
  const user = model.read(id);

  // NOTE: for debugging/demo purposes only!
  logger.info(`Password: ${crypto.decrypt(user.password)}`);

  return user;
}

// -- Update

function update(id, data) {
  return model.update(id, data);
}

// -- Delete

function del(id) {
  return model.del(id);
}

// -- List

function list(filter) {
  return model.list(filter);
}

// -- Helper: token generator

function makeTokens(user) {
  const jwtAuthContent = {
    u: user.id,
  };

  // TODO: add refresh tokens
  const authToken = jwt.sign(jwtAuthContent, secret, { expiresIn: expire });

  return {
    authToken,
  };
}

// -- Handles user login

function auth(data) {
  const { username, password } = data;
  const users = model.list({ username });

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
  auth,
  makeTokens,
};
