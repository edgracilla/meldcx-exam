/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import util from 'util';
import fsp from 'fs/promises';

import { pipeline } from 'stream';
import { customAlphabet } from 'nanoid';
import { extname, basename } from 'path';

import config from '../../config.mjs';
import { ApiError, Cruder, logger } from '../../cores/index.mjs';

const fileUrl = import.meta.url;
const filesDb = new Cruder(fileUrl);

const pump = util.promisify(pipeline);
const readFileAsync = util.promisify(fs.readFile);

// Using custom alphabet for ease of copying generated string
// default nanoid() includes '-' which is not included when you double click the string
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 21);

/** handle upload */

async function handleUpload(data, meta) {
  const { userId } = meta;

  const publicKey = nanoid();
  const privateKey = nanoid();
  const ext = extname(data.filename);
  const filePath = `${config.uploads}/${publicKey}${ext}`;

  // Write file to disc
  await pump(data.file, fs.createWriteStream(filePath));

  // Write file record
  filesDb.insert({
    userId,
    filePath,
    id: publicKey,
    privateKey,
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
    // Read file data asynchronously
    const fileData = await readFileAsync(filePath);

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

  if (rec.userId !== userId) {
    throw new ApiError(401, 'You are not authorized to perform the operation!');
  }

  try {
    // Delete file from disk
    await fsp.unlink(rec.filePath);

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
