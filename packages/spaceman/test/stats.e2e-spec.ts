import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import nock from 'nock';
import { AppModule } from '../src/app.module';
import { gqlRequest } from './utils/utils';

const gql = String.raw;

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Public Stats', () => {
    it('should return an error if unable to communicate with gocardless', async () => {
      nock('https://api-sandbox.gocardless.com/')
        .get('/subscriptions?status=active')
        .reply(400);
      const query = gql`
        {
          stats {
            income
            numMembers
            average
            numLessAverage
          }
        }
      `;
      const result = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      expect(result.body.errors.length).toBe(1);
      expect(result.body.errors[0].message).toBe(
        'Failed to connect to GoCardless',
      );
    });

    it('should return stats from a gocardless response', async () => {
      nock('https://api-sandbox.gocardless.com/')
        .get('/subscriptions?status=active')
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
      const query = gql`
        {
          stats {
            income
            numMembers
            average
            numLessAverage
          }
        }
      `;
      const result = await gqlRequest(app, query);
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
