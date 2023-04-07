import { agent } from 'supertest';

import app from '../../index.mjs';
import fxt from '../fixtures/index.mjs';
import ctlUser from '../../src/modules/users/controller.mjs';

let user = null;
let fileKeys = null;
let authToken = null;

const api = agent(app.server);

describe('Files Integration Tests', () => {
  beforeAll(async () => {
    await app.ready();

    user = ctlUser.create(fxt.user1);
    const ret = ctlUser.makeTokens(fxt.user1);
    authToken = `Bearer ${ret.authToken}`;
  });

  afterAll(async () => {
    ctlUser.del(user.id);
    await app.close();
  });

  it('should upload file', async () => {
    const buffer = Buffer.from('some data');

    const { status, body } = await api
      .post('/files/upload')
      .set('Authorization', authToken)
      .attach('file', buffer, 'sample.txt');

    fileKeys = body;
    expect(status).toBe(201);
  });

  it('should download file', async () => {
    const { status, body } = await api
      .get(`/files/${fileKeys.publicKey}`);

    expect(status).toBe(200);
    expect(body.toString()).toBe('some data');
  });

  it('should delete file', async () => {
    const { status, body } = await api
      .delete(`/files/${fileKeys.privateKey}`)
      .set('Authorization', authToken);

    expect(status).toBe(200);
    expect(body.deleted).toBe(true);
  });
});
