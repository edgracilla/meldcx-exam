import { customAlphabet } from 'nanoid';
import { extname, basename } from 'path';

import config from '../../config.mjs';
import localStorage from './providers/local.mjs';
import googleStorage from './providers/google.mjs';
import { ApiError, Cruder, logger } from '../../cores/index.mjs';

const fileUrl = import.meta.url;
const model = new Cruder(fileUrl);
const nanoid = customAlphabet(config.idAlphabet, 21);

// TODO: Use switch if we have more than 2 providers
const provider = config.provider === 'local'
  ? localStorage
  : googleStorage;

// -- File upload handler

async function handleUpload(data, meta) {
  const { userId } = meta;

  // File rec prep
  const now = Date.now();
  const publicKey = nanoid();
  const privateKey = nanoid();

  const ext = extname(data.filename);
  const filename = `${publicKey}${ext}`;

  // Write file to disk or upload to storage provider
  const filePath = await provider.uploadFile(data.file, filename);

  // Write file record
  model.insert({
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

// -- File download handler

async function fetchFileData(publicKey) {
  // Get file record using publicKey/rec id
  const rec = model.read(publicKey);

  if (!rec) {
    throw new ApiError(404, 'File not found!');
  }

  const { filePath } = rec;

  try {
    // Get file data from any provider provided
    const fileData = await provider.downloadFile(filePath);

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

// -- Get file record

function getRec(id) {
  return model.read(id);
}

// -- Reusable destroy file function

async function destroy(rec) {
  const { id, filePath } = rec;

  try {
    // Delete file from disk or storage provider
    await provider.deleteFile(filePath);

    // Delete file record
    const deleted = model.del(id);

    return { deleted };
  } catch (err) {
    logger.warn(err);
    throw new ApiError(500, 'Error deleting file!');
  }
}

// -- Del file request handler

async function del(privateKey, meta) {
  const { userId } = meta;

  // Get file record using privateKey
  const rec = model.read(privateKey, 'privateKey');

  if (!rec) {
    throw new ApiError(404, 'File not found!');
  }

  // Del file sec, only owner can delete thier own file
  if (rec.owner !== userId) {
    throw new ApiError(401, 'You are not authorized to perform the operation!');
  }

  // Call reusable destroy file function
  const result = await destroy(rec);

  return result;
}

// -- List file records

function list(filter) {
  return model.list(filter);
}

export default {
  handleUpload,
  fetchFileData,
  destroy,
  getRec,
  list,
  del,
};
