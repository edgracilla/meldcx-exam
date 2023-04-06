/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import util from 'util';
import fsp from 'fs/promises';

import { pipeline } from 'stream';
import config from '../../../config.mjs';

const pump = util.promisify(pipeline);
const readFileAsync = util.promisify(fs.readFile);

async function uploadFile(data, fileName) {
  const filePath = `${config.uploads}/${fileName}`;
  await pump(data, fs.createWriteStream(filePath));

  return filePath;
}

async function downloadFile(filePath) {
  const fileData = await readFileAsync(filePath);

  return fileData;
}

async function deleteFile(filePath) {
  await fsp.unlink(filePath);
}

export default {
  uploadFile,
  downloadFile,
  deleteFile,
};
