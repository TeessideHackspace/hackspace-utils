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

  describe('Ses Connection', () => {
    it('should return no connection to begin with', async () => {
      client.auth.roles = 'admin';
      const result = await client.admin.getSesConnection();
      expect(result.status).toBe(200);
      expect(result.body.data.sesConnection).toEqual(null);
    });

    it('should allow an admin to create a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setSesConnection(
        'eu-west-1',
        'AKIAIOSFODNN7EXAMPLE',
        'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      );
      expect(mutationResult.status).toBe(200);

      expect(mutationResult.body.data.setSesConnection).toMatchObject({
        awsRegion: 'eu-west-1',
        awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      });

      const result = await client.admin.getSesConnection();
      expect(result.status).toBe(200);
      expect(result.body.data.sesConnection).toMatchObject({
        awsRegion: 'eu-west-1',
        awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      });
    });

    it('should not allow a non admin to create a connection', async () => {
      const mutationResult = await client.admin.setSesConnection(
        'eu-west-1',
        'AKIAIOSFODNN7EXAMPLE',
        'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should not allow a non admin to retrieve a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setSesConnection(
        'eu-west-1',
        'AKIAIOSFODNN7EXAMPLE',
        'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setSesConnection).toMatchObject({
        awsRegion: 'eu-west-1',
        awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      });

      client.auth.roles = '';
      const result = await client.admin.getSesConnection();
      expect(result.status).toBe(200);
      expect(result.body.errors[0].message).toBe('Forbidden resource');
    });
  });

  describe('Global Settings', () => {
    it('should return no global settings to begin with', async () => {
      client.auth.roles = 'admin';
      const result = await client.admin.getGlobalSettings();
      expect(result.status).toBe(200);
      expect(result.body.data.globalSettings).toEqual(null);
    });

    it('should allow an admin to set global settings', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setGlobalSettings(
        'my site',
        'admin@example.com',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setGlobalSettings).toMatchObject({
        siteName: 'my site',
        adminEmail: 'admin@example.com',
      });

      const result = await client.admin.getGlobalSettings();
      expect(result.status).toBe(200);
      expect(result.body.data.globalSettings).toMatchObject({
        siteName: 'my site',
        adminEmail: 'admin@example.com',
      });
    });

    it('should not allow a non admin to create a connection', async () => {
      const mutationResult = await client.admin.setGlobalSettings(
        'my site',
        'admin@example.com',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should not allow a non admin to retrieve a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setGlobalSettings(
        'my site',
        'admin@example.com',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setGlobalSettings).toMatchObject({
        siteName: 'my site',
        adminEmail: 'admin@example.com',
      });

      client.auth.roles = '';
      const result = await client.admin.getGlobalSettings();
      expect(result.status).toBe(200);
      expect(result.body.errors[0].message).toBe('Forbidden resource');
    });
  });

  describe('Keycloak Connection', () => {
    it('should return no connection to begin with', async () => {
      client.auth.roles = 'admin';
      const result = await client.admin.getKeycloakConnection();
      expect(result.status).toBe(200);
      expect(result.body.data.keycloakConnection).toEqual(null);
    });

    it('should allow an admin to create a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setKeycloakConnection(
        'http://example.com',
        'admin',
        'password',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setKeycloakConnection).toMatchObject({
        keycloakBaseUrl: 'http://example.com',
        keycloakAdminUsername: 'admin',
        keycloakAdminPassword: 'password',
      });

      const result = await client.admin.getKeycloakConnection();
      expect(result.status).toBe(200);
      expect(result.body.data.keycloakConnection).toMatchObject({
        keycloakBaseUrl: 'http://example.com',
        keycloakAdminUsername: 'admin',
        keycloakAdminPassword: 'password',
      });
    });

    it('should not allow a non admin to create a connection', async () => {
      const mutationResult = await client.admin.setKeycloakConnection(
        'http://example.com',
        'admin',
        'password',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should not allow a non admin to retrieve a connection', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setKeycloakConnection(
        'http://example.com',
        'admin',
        'password',
      );
      expect(mutationResult.status).toBe(200);
      expect(mutationResult.body.data.setKeycloakConnection).toMatchObject({
        keycloakBaseUrl: 'http://example.com',
        keycloakAdminUsername: 'admin',
        keycloakAdminPassword: 'password',
      });

      client.auth.roles = '';
      const result = await client.admin.getKeycloakConnection();
      expect(result.status).toBe(200);
      expect(result.body.errors[0].message).toBe('Forbidden resource');
    });
  });
});
