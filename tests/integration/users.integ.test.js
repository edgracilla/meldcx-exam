import { agent } from 'supertest';

import app from '../../index.mjs';
import fxt from '../fixtures/index.mjs';

let user = null;
let authToken = null;
const api = agent(app.server);

describe('Users Integration Tests', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create user', async () => {
    const { body, status } = await api
      .post('/users/signup')
      .send(fxt.user1);

    expect(status).toBe(201);
    user = body;
  });

  it('should signin', async () => {
    const { body, status } = await api
      .post('/users/login')
      .send(fxt.user1);

    expect(status).toBe(200);
    authToken = `Bearer ${body.authToken}`;
  });

  it('should get user', async () => {
    const { body, status } = await api
      .get(`/users/${user.id}`)
      .set('Authorization', authToken);

    expect(status).toBe(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(user.id),
        password: expect.stringMatching(user.password),
        username: expect.stringMatching(user.username),
      }),
    );
  });

  it('should delete user record', async () => {
    const { status } = await api
      .delete(`/users/${user.id}`)
      .set('Authorization', authToken)
      .send(fxt.user1);

    expect(status).toBe(204);
  });
});
