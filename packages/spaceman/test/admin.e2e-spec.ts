import { TestClient } from './utils/client';

describe('Admin', () => {
  const client: TestClient = new TestClient();

  beforeEach(async () => {
    process.env.ROLES_CLAIM = client.auth.rolesClaim;
    await client.setup();
  });

  afterEach(async () => {
    await client.teardown();
  });

  describe('Listing users', () => {
    it('should not allow a user with no roles to list users', async () => {
      const result = await client.admin.listUsers();
      expect(result.status).toBe(200);
      expect(result.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should not allow a non-admin to list users', async () => {
      client.auth.roles = 'user';
      const result = await client.admin.listUsers();
      expect(result.status).toBe(200);
      expect(result.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should allow an admin to list users', async () => {
      client.auth.roles = 'admin';
      const result = await client.admin.listUsers();
      expect(result.status).toBe(200);
      expect(result.body.data.users).toEqual([]);
    });

    it('should support roles in JSON format', async () => {
      client.auth.roles = '["admin"]';
      const result = await client.admin.listUsers();
      expect(result.status).toBe(200);
      expect(result.body.data.users).toEqual([]);
    });

    it('should return users when users exist', async () => {
      const result = await client.user.me();
      expect(result.status).toBe(200);

      client.auth.sub = 'admin-user';
      client.auth.roles = 'admin';
      const listResult = await client.admin.listUsers();
      expect(listResult.status).toBe(200);
      expect(listResult.body.data.users[0]).toMatchObject({
        gocardlessId: null,
        id: expect.stringMatching(/^[0-9]{1,5}$/),
        nickname: null,
      });
    });
  });

  describe('Gocardless Connection', () => {
    it('should return no connection to begin with', async () => {
      client.auth.roles = 'admin';
      const result = await client.admin.getGocardlessConnection();
      expect(result.status).toBe(200);
      expect(result.body.data.gocardlessConnection).toEqual(null);
    });

    it('should allow an admin to create a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setGocardlessConnection).toMatchObject({
        key: 'foo',
        redirectUri: 'http://example.com',
        webhookSecret: 'bar',
      });

      const result = await client.admin.getGocardlessConnection();
      expect(result.status).toBe(200);
      expect(result.body.data.gocardlessConnection).toMatchObject({
        key: 'foo',
        redirectUri: 'http://example.com',
        webhookSecret: 'bar',
      });
    });

    it('should not allow a non admin to create a connection', async () => {
      const mutationResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should not allow a non admin to retrieve a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setGocardlessConnection).toMatchObject({
        key: 'foo',
        redirectUri: 'http://example.com',
        webhookSecret: 'bar',
      });

      client.auth.roles = '';
      const result = await client.admin.getGocardlessConnection();
      expect(result.status).toBe(200);
      expect(result.body.errors[0].message).toBe('Forbidden resource');
    });
  });
});
