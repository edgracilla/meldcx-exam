// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';

import fxt from '../../fixtures/index.mjs';
import ctlUser from '../../../src/modules/users/controller.mjs';
import ctlFile from '../../../src/modules/files/controller.mjs';
import provider from '../../../src/modules/files/providers/local.mjs';

let meta = null;
let user = null;
let fileRec = null;

describe('Files Controller - Unit Tests', () => {
  beforeAll(() => {
    user = ctlUser.create(fxt.user1);
    meta = { userId: user.id };
  });

  afterAll(() => {
    ctlUser.del(user.id);
  });

  it('should handle file upload', async () => {
    const fileData = {
      file: 'foobar',
      filename: 'sample.txt',
    };

    fileRec = await ctlFile.handleUpload(fileData, meta);

    expect(fileRec).toEqual(
      expect.objectContaining({
        publicKey: expect.any(String),
        privateKey: expect.any(String),
      }),
    );
  });

  it('should handle file download', async () => {
    const ret = await ctlFile.fetchFileData(fileRec.publicKey);

    expect(ret).toEqual(
      expect.objectContaining({
        fileData: expect.any(Buffer),
        fileName: expect.any(String),
      }),
    );
  });

  it('should catch file not found on download', async () => {
    await expect(ctlFile.fetchFileData('foobar')).rejects.toThrow('File not found!');
  });

  it('should catch edge case on download', async () => {
    jest.spyOn(provider, 'downloadFile').mockRejectedValue(new Error('Foo bars!'));
    await expect(ctlFile.fetchFileData(fileRec.publicKey)).rejects.toThrow('Error fetching file!');
  });

  it('should handle file delete request', async () => {
    const ret = await ctlFile.del(fileRec.privateKey, meta);

    expect(ret).toEqual(
      expect.objectContaining({
        deleted: expect.any(Boolean),
      }),
    );
  });

  it('should delete using file record', async () => {
    const fileData = { file: 'foobar', filename: 'sample.txt' };
    fileRec = await ctlFile.handleUpload(fileData, meta);
    fileRec = await ctlFile.getRec(fileRec.publicKey);
    const ret = await ctlFile.destroy(fileRec);

    expect(ret).toEqual(
      expect.objectContaining({
        deleted: expect.any(Boolean),
      }),
    );
  });
});
