import jwt from 'jsonwebtoken';
import config from './config.mjs';
import { ApiError } from './cores/index.mjs';

const noAuthRoutes = {
  GET: ['/files'],
  POST: ['/users/login', '/users/signup'],
};

const auth = () => async (req) => {
  const [path] = req.url.split(/\?/);
  const authzn = req.headers.authorization;
  const noAuths = noAuthRoutes[req.method] || [];

  // Skip authentication for no auth routes defined
  for (let i = 0; i < noAuths.length; i += 1) {
    if (path.match(`^${noAuths[i]}`)) {
      return;
    }
  }

  if (!authzn) throw new ApiError(401, 'Authentication token is required.');
  if (!authzn.startsWith('Bearer')) throw new ApiError(401, 'Invalid authentication token.');

  try {
    // Authenticate
    const { u: userId } = jwt.verify(authzn.slice(7), config.jwt.secret);

    // Append authenticated userId for future use
    // This serves as a user fingerprint in every request
    req.meta = { userId };
  } catch (error) {
    throw new ApiError(403, error.message);
  }
};

export default auth;
