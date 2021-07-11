import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/user/user.entity';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { gqlRequest } from './utils/utils';

const gql = String.raw;

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let sub: string | undefined = 'default';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const ctx = GqlExecutionContext.create(context);
          ctx.getContext().user = { sub }; // Your user object
          return true;
        },
      })
      .compile();

    userRepository = moduleFixture.get('UserRepository');

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    sub = 'default';
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
            id: expect.stringMatching(/^[0-9]{1,2}$/),
            nickname: null,
          },
        },
      });
    });

    it('should return an error if no token was given', async () => {
      sub = undefined;
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
  });
});
