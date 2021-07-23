import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/user/user.entity';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { gqlRequest, TestAuthContext } from './utils/utils';

const gql = String.raw;

describe('Admin', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let auth = new TestAuthContext();

  beforeEach(async () => {
    process.env.ROLES_CLAIM = auth.rolesClaim;

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
    await userRepository.query(`DELETE FROM "address";`);
    await app.close();
  });

  it('should not allow a user with no roles t olist users', async () => {
    const query = gql`
      {
        users {
          id
        }
      }
    `;
    const result = await gqlRequest(app, query);
    expect(result.status).toBe(200);
    expect(result.body.errors[0].message).toBe('Forbidden resource');
  });

  it('should not allow a non-admin to list users', async () => {
    auth.roles = 'user';
    const query = gql`
      {
        users {
          id
        }
      }
    `;
    const result = await gqlRequest(app, query);
    expect(result.status).toBe(200);
    expect(result.body.errors[0].message).toBe('Forbidden resource');
  });

  it('should allow an admin to list users', async () => {
    auth.roles = 'admin';
    const query = gql`
      {
        users {
          id
        }
      }
    `;
    const result = await gqlRequest(app, query);
    expect(result.status).toBe(200);
    expect(result.body.data.users).toEqual([]);
  });

  it('should support roles in JSON format', async () => {
    auth.roles = '["admin"]';
    const query = gql`
      {
        users {
          id
        }
      }
    `;
    const result = await gqlRequest(app, query);
    expect(result.status).toBe(200);
    expect(result.body.data.users).toEqual([]);
  });

  it('should return users when users exist', async () => {
    let query = gql`
      {
        me {
          id
        }
      }
    `;
    let result = await gqlRequest(app, query);
    expect(result.status).toBe(200);

    auth.sub = 'admin-user';
    auth.roles = 'admin';
    query = gql`
      {
        users {
          gocardlessId
          id
          nickname
        }
      }
    `;
    result = await gqlRequest(app, query);
    expect(result.status).toBe(200);
    expect(result.body.data.users[0]).toMatchObject({
      gocardlessId: null,
      id: expect.stringMatching(/^[0-9]{1,5}$/),
      nickname: null,
    });
  });
});
