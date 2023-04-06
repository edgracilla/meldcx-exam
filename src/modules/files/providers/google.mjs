/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import { Storage } from '@google-cloud/storage';

import localStorage from './local.mjs';
import config from '../../../config.mjs';

const google = JSON.parse(fs.readFileSync(config.providerConf));

const storage = new Storage({
  projectId: google.projectId,
  credentials: google.credentials,
});

// Upload a file to a bucket
const uploadFile = async (data, fileName) => {
  const filePath = await localStorage.uploadFile(data, fileName);

  await storage
    .bucket(google.bucket)
    .upload(filePath, {
      destination: fileName,
    });

  await localStorage.deleteFile(filePath);

  return fileName;
};

// Download a file from a bucket
const downloadFile = async (fileName) => {
  const tempFolder = './temp';
  const tempFilePath = `${tempFolder}/${fileName}`;

  // Create temp folder if not exist
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  // Download target file from Google Cloud Storage to our server
  await storage.bucket(google.bucket).file(fileName).download({
    destination: tempFilePath,
  });

  // Read file contents so that we can return the raw file
  const fileData = await localStorage.downloadFile(tempFilePath);

  // Clean as you go, it was stored in Cloud Storage btw
  await localStorage.deleteFile(tempFilePath);

  return fileData;
};

// Delete a file from a bucket
const deleteFile = async (filePath) => {
  await storage.bucket(google.bucket).file(filePath).delete();
};

export default {
  uploadFile,
  downloadFile,
  deleteFile,
};
