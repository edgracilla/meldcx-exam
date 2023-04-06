import jwt from 'jsonwebtoken';

import * as core from '../../cores/index.mjs';
import userCtl from '../users/controller.mjs';

import config from '../../config.mjs';

const { ApiError, crypto } = core;

const {
  secret,
  expire,
  refreshExpire,
  refreshSecret,
} = config.jwt;

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

async function authenticate(data) {
  const { username, password } = data;
  const users = await userCtl.list({ username });

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
  authenticate,
};
