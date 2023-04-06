/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import util from 'util';
import fsp from 'fs/promises';

import { pipeline } from 'stream';
import config from '../../../config.mjs';

const pump = util.promisify(pipeline);
const readFileAsync = util.promisify(fs.readFile);

async function writeFile(data, fileName) {
  const filePath = `${config.uploads}/${fileName}`;
  await pump(data, fs.createWriteStream(filePath));

  return filePath;
}

async function destroyFile(filePath) {
  await fsp.unlink(filePath);
}

async function getFile(filePath) {
  const fileData = await readFileAsync(filePath);

  return fileData;
}

export default {
  destroyFile,
  writeFile,
  getFile,
};
