import { customAlphabet } from 'nanoid';
import { extname, basename } from 'path';

import localProvider from './providers/local.mjs';
import { ApiError, Cruder, logger } from '../../cores/index.mjs';

const fileUrl = import.meta.url;
const filesDb = new Cruder(fileUrl);

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 21);

const provider = localProvider;

/** handle upload */

async function handleUpload(data, meta) {
  const { userId } = meta;

  const now = Date.now();
  const publicKey = nanoid();
  const privateKey = nanoid();

  const ext = extname(data.filename);
  const filename = `${publicKey}${ext}`;

  // Write file to disk or upload to storage provider
  const filePath = await provider.writeFile(data.file, filename);

  // Write file record
  filesDb.insert({
    id: publicKey,
    privateKey,
    filePath,
    owner: userId,
    createdAt: new Date(now).toISOString(),
  });

  return {
    publicKey,
    privateKey,
  };
}

/** read */

async function fetchFileData(publicKey) {
  const rec = filesDb.read(publicKey);

  if (!rec) {
    throw new ApiError(404, 'File not found!');
  }

  const { filePath } = rec;

  try {
    // Get file data from any provider provided
    const fileData = await provider.getFile(filePath);

    return {
      fileData,
      fileName: basename(filePath),
    };
  } catch (err) {
    // Handle any errors that occur during file reading
    logger.warn(`Error fetching file data: ${err}`);
    throw new ApiError(400, 'Error fetching file!');
  }
}

/** delete */

async function del(privateKey, meta) {
  const { userId } = meta;

  const rec = filesDb.read(privateKey, 'privateKey');

  if (!rec) {
    throw new ApiError(404, 'File not found!');
  }

  if (rec.owner !== userId) {
    throw new ApiError(401, 'You are not authorized to perform the operation!');
  }

  try {
    // Delete file from disk or storage provider
    await provider.destroyFile(rec.filePath);

    // Delete file record
    const deleted = filesDb.del(rec.id);

    return { deleted };
  } catch (err) {
    logger.warn(err);
    throw new ApiError(500, 'Error deleting file!');
  }
}

export default {
  handleUpload,
  fetchFileData,
  del,
};
