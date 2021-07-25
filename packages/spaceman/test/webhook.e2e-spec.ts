import { TestClient } from './utils/client';
import request from 'supertest';

describe('Webhooks', () => {
  const client: TestClient = new TestClient();

  beforeEach(async () => {
    process.env.ROLES_CLAIM = client.auth.rolesClaim;
    await client.setup();
  });

  afterEach(async () => {
    await client.teardown();
  });

  describe('Gocardless Webhook', () => {
    it('should throw an error if the webhook signature is omitted', async () => {
      const result = await request(client.app!.getHttpServer())
        .post('/webhook/gocardless')
        .send({
          foo: 'bar',
        });
      expect(result.status).toBe(400);
      expect(result.body.message).toBe('Missing webhook-signature header');
    });

    it('should throw an error if gocardless is not configured', async () => {
      const result = await request(client.app!.getHttpServer())
        .post('/webhook/gocardless')
        .set('webhook-signature', 'foo')
        .send({
          foo: 'bar',
        });
      expect(result.status).toBe(500);
    });

    it('should throw an error if the signature is invalid', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(mutationResult.status).toBe(200);

      const result = await request(client.app!.getHttpServer())
        .post('/webhook/gocardless')
        .set('webhook-signature', 'foo')
        .send({
          foo: 'bar',
        });
      expect(result.status).toBe(400);
      expect(result.body.message).toBe('Webhook signature invalid');
    });

    it('should succeed for an empty event list with valid signature', async () => {
      client.auth.roles = 'admin';
      const mutationResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(mutationResult.status).toBe(200);

      const result = await request(client.app!.getHttpServer())
        .post('/webhook/gocardless')
        .set(
          'webhook-signature',
          '2de21256e6af97c030f75c02ea4e12a6bd4385ce746479e1a1df6ab6e552f3f2',
        )
        .send({
          events: [],
        });
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
    });
  });
});
