import fxt from '../../fixtures/index.mjs';
import ctl from '../../../src/modules/users/controller.mjs';

let user1 = null;

describe('Users Controller - Unit Tests', () => {
  describe('Basic Operations', () => {
    it('should create user', async () => {
      user1 = ctl.create(fxt.user1);

      expect(user1).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          password: expect.any(String),
          username: expect.stringMatching(fxt.user1.username),
        }),
      );
    });

    it('should halt creation of existing user', async () => {
      const wrapped = () => {
        ctl.create(fxt.user1);
      };

      expect(wrapped).toThrow('Username already exist!');
    });

    it('should get user record', async () => {
      const ret = ctl.read(user1.id);

      expect(ret).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(user1.id),
          password: expect.stringMatching(user1.password),
          username: expect.stringMatching(user1.username),
        }),
      );
    });

    it('should update user record', async () => {
      user1 = ctl.update(user1.id, {
        username: 'antagonist', // NOTE: inappropriate, for demo pusposes only!
      });

      expect(user1).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(user1.id),
          password: expect.stringMatching(user1.password),
          username: expect.stringMatching('antagonist'),
        }),
      );
    });

    it('should list user records', async () => {
      const ret = ctl.list();

      expect(ret).toEqual(
        expect.arrayContaining([user1]),
      );
    });
  });

  describe('Auth Related', () => {
    it('should make user tokens', async () => {
      const ret = ctl.makeTokens(user1);

      expect(ret).toEqual(
        expect.objectContaining({
          authToken: expect.any(String),
        }),
      );
    });

    it('should authenticate', async () => {
      const ret = ctl.auth({
        username: user1.username,
        password: fxt.user1.password,
      });

      expect(ret).toEqual(
        expect.objectContaining({
          authToken: expect.any(String),
        }),
      );
    });

    it('should capture user not found', async () => {
      const wrapped = () => {
        ctl.auth({
          username: 'foobaz',
          password: 'dummypass',
        });
      };

      expect(wrapped).toThrow('User not found!');
    });

    it('should halt invalid pass', async () => {
      const wrapped = () => {
        ctl.auth({
          username: user1.username,
          password: 'dummypass',
        });
      };

      expect(wrapped).toThrow('Invalid password!');
    });
  });

  describe('Cleanup', () => {
    it('should delete user record', async () => {
      const ret = ctl.del(user1.id);
      expect(ret).toEqual(true);
    });
  });
});
