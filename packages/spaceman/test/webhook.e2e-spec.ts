import { TestClient } from './utils/client';
import request from 'supertest';
import nock from 'nock';
import { User } from 'src/graphql/user/user.entity';

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
    describe('Validation', () => {
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

  describe('Event Processing', () => {
    it('should update the keycloak roles when a subscription is created', async () => {
      await client.user.me();
      const user: User = await client.repository!.findOne({
        where: { sub: 'default' },
      });
      user.gocardlessId = 'some-gocardless-id';
      user.nickname = 'Bob';
      await client.repository?.save(user);

      client.auth.roles = 'admin';
      await client.admin.setGocardlessConnection(
        'foo',
        'http://gocardless.example.com',
        'bar',
      );
      await client.admin.setKeycloakConnection(
        'https://keycloak.example.com',
        'admin',
        'password',
      );
      await client.admin.setSesConnection('eu-west-1', 'foo', 'bar');
      await client.admin.setGlobalSettings('My Site', 'admin@example.com');

      let emailBody: any = {};
      nock('https://email.eu-west-1.amazonaws.com/')
        .post('/', (body) => {
          emailBody = body;
          return body;
        })
        .reply(200);
      nock('https://api-sandbox.gocardless.com/')
        .get('/subscriptions/foo')
        .reply(200, {
          subscriptions: {
            links: {
              mandate: 'some-mandate-id',
            },
          },
        });
      nock('https://api-sandbox.gocardless.com/')
        .get('/mandates/some-mandate-id')
        .reply(200, {
          mandates: {
            links: {
              customer: 'some-gocardless-id',
            },
          },
        });
      nock('https://api-sandbox.gocardless.com/')
        .get('/customers/some-gocardless-id')
        .reply(200, {
          customers: {
            id: 'some-gocardless-id',
          },
        });
      nock('https://keycloak.example.com')
        .post(
          '/realms/master/protocol/openid-connect/token',
          'username=admin&password=password&grant_type=password&client_id=admin-cli',
        )
        .times(3)
        .reply(200, { access_token: 'foo' });

      nock('https://keycloak.example.com/')
        .get('/admin/realms/master/users/default')
        .reply(200, {
          firstName: 'Robert',
          email: 'bob@example.com',
        });
      nock('https://keycloak.example.com/')
        .get('/admin/realms/master/roles/member')
        .reply(200, {
          id: 'member-id',
          name: 'member',
        });
      nock('https://keycloak.example.com/')
        .post('/admin/realms/master/users/default/role-mappings/realm', [
          { id: 'member-id', name: 'member' },
        ])
        .reply(200);

      const result = await request(client.app!.getHttpServer())
        .post('/webhook/gocardless')
        .set(
          'webhook-signature',
          '3b82f2a4e637cd222b87258e73b4eb6df9e5de3ee67ebdec605bca32192dc8de',
        )
        .send({
          events: [
            {
              resource_type: 'subscriptions',
              action: 'created',
              links: {
                subscription: 'foo',
              },
            },
          ],
        });
      console.log(result.body);
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(emailBody.Action).toBe('SendRawEmail');
      expect(emailBody['Destinations.member.1']).toBe('bob@example.com');
      expect(emailBody['Source']).toBe('admin@example.com');
      expect(emailBody['Version']).toBe('2010-12-01');
    });
  });
});
