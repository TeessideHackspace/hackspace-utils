import nock from 'nock';
import { TestClient } from './utils/client';

describe('Spaceman', () => {
  const client: TestClient = new TestClient();

  beforeEach(async () => {
    process.env.ROLES_CLAIM = client.auth.rolesClaim;
    await client.setup();
    client.auth.sub = undefined;
  });

  afterEach(async () => {
    await client.teardown();
  });

  describe('Public Stats', () => {
    it('should return an error if gocardless is unconfigured', async () => {
      const result = await client.stats.stats();
      expect(result.status).toBe(200);
      expect(result.body.errors.length).toBe(1);
      expect(result.body.errors[0].message).toBe(
        'Failed to connect to GoCardless',
      );
    });

    it('should return an error if unable to communicate with gocardless', async () => {
      client.auth.roles = 'admin';
      const connectionSettingsResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(connectionSettingsResult.status).toBe(200);
      nock('https://api-sandbox.gocardless.com/')
        .get('/subscriptions?status=active')
        .reply(400);
      const result = await client.stats.stats();
      expect(result.status).toBe(200);
      expect(result.body.errors.length).toBe(1);
      expect(result.body.errors[0].message).toBe(
        'Failed to connect to GoCardless',
      );
    });

    it('should return stats from a gocardless response', async () => {
      client.auth.reset();
      client.auth.roles = 'admin';
      const connectionSettingsResult = await client.admin.setGocardlessConnection(
        'foo',
        'http://example.com',
        'bar',
      );
      expect(connectionSettingsResult.status).toBe(200);
      expect(connectionSettingsResult.body.errors).not.toBeDefined();
      nock('https://api-sandbox.gocardless.com/')
        .get('/subscriptions?status=active')
        .matchHeader('Authorization', 'Bearer foo')
        .reply(200, {
          meta: {
            cursors: {
              before: null,
              after: null,
            },
            limit: 50,
          },
          subscriptions: [
            {
              amount: 1000,
            },
            {
              amount: 2000,
            },
            {
              amount: 3000,
            },
          ],
        });
      client.auth.sub = 'undefined';
      const result = await client.stats.stats();
      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        data: {
          stats: {
            average: 2000,
            income: 6000,
            numLessAverage: 1,
            numMembers: 3,
          },
        },
      });
    });
  });
});
