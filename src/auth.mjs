import jwt from 'jsonwebtoken';
import config from './config.mjs';
import { ApiError } from './cores/index.mjs';

const noAuthRoutes = {
  POST: [
    '/users/login',
    '/users/signup',
  ],
  GET: [
    '/files',
  ],
};

const auth = () => async (req) => {
  const [path] = req.url.split(/\?/);
  const authzn = req.headers.authorization;
  const noAuths = noAuthRoutes[req.method] || [];

  for (let i = 0; i < noAuths.length; i += 1) {
    if (path.match(`^${noAuths[i]}`)) {
      return;
    }
  }

  if (!authzn) throw new ApiError(401, 'Authentication token is required.');
  if (!authzn.startsWith('Bearer')) throw new ApiError(401, 'Invalid authentication token.');

  try {
    jwt.verify(authzn.slice(7), config.jwt.secret);
  } catch (error) {
    throw new ApiError(403, error.message);
  }
};

export default auth;
