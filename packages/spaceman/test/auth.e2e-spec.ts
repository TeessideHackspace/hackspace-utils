import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/user/user.entity';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { gqlRequest, TestAuthContext } from './utils/utils';

const gql = String.raw;

describe('Spaceman', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let auth = new TestAuthContext();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(auth.guard())
      .compile();

    userRepository = moduleFixture.get('UserRepository');

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    auth.reset();
    await userRepository.query(`DELETE FROM "user";`);
    await app.close();
  });

  describe('Auth', () => {
    it('should return a user record given a valid token', async () => {
      const query = gql`
        {
          me {
            id
            nickname
            gocardlessId
          }
        }
      `;
      const result = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      expect(result.body).toMatchObject({
        data: {
          me: {
            gocardlessId: null,
            id: expect.stringMatching(/^[0-9]{1,5}$/),
            nickname: null,
          },
        },
      });
    });

    it('should return an error if no token was given', async () => {
      auth.sub = undefined;
      const query = gql`
        {
          me {
            id
          }
        }
      `;
      const result = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      expect(result.body.errors.length).toBe(1);
      expect(result.body.errors[0].message).toBe('User is not authenticated');
    });

    it('should return different IDs for different users', async () => {
      const query = gql`
        {
          me {
            id
          }
        }
      `;
      const result = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      const user1Id = result.body.data.me.id;
      auth.sub = 'foo';
      const result2 = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      expect(result2.body.data.me.id).not.toBe(user1Id);
    });

    it('should return the same IDs for the same user', async () => {
      const query = gql`
        {
          me {
            id
          }
        }
      `;
      const result = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      const user1Id = result.body.data.me.id;
      const result2 = await gqlRequest(app, query);
      expect(result.status).toBe(200);
      expect(result2.body.data.me.id).toBe(user1Id);
    });
  });
});
