import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import request from 'supertest';
import { Repository } from 'typeorm';
import { isString } from 'class-validator';

function quoteString<T>(str: T): T | String {
  if (isString(str)) {
    return `"${str}"`;
  }

  return str;
}

const gql = String.raw;

export class TestAuthContext {
  rolesClaim: string = 'http://example.com/roles';
  sub: string | undefined = 'default';
  roles: string | undefined = '';

  reset() {
    this.sub = 'default';
    this.roles = '';
  }

  guard() {
    return {
      canActivate: (context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context);
        ctx.getContext().user = { sub: this.sub };
        ctx.getContext().user[this.rolesClaim] = this.roles;
        return true;
      },
    };
  }
}

export class TestClient {
  public auth: TestAuthContext = new TestAuthContext();
  public app?: INestApplication;
  private repository?: Repository<any>;
  constructor() {}

  async setup() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(this.auth.guard())
      .compile();

    this.repository = moduleFixture.get('UserRepository');

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalPipes(new ValidationPipe());
    await this.app.init();
  }

  async teardown() {
    this.auth.reset();
    await this.repository!.query(`DELETE FROM "user";`);
    await this.repository!.query(`DELETE FROM "address";`);
    await this.repository!.query(`DELETE FROM "gocardlessConnection";`);
    await this.app!.close();
  }

  gqlRequest(query: string) {
    return request(this.app!.getHttpServer()).post('/graphql').send({
      query: query,
    });
  }

  stats = {
    stats: async () => {
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
      return this.gqlRequest(query);
    },
  };

  admin = {
    setGocardlessConnection: async (key: string, redirectUri: string) => {
      const query = gql`
        mutation {
          setGocardlessConnection(
            connection: { key: "${key}", redirectUri: "${redirectUri}" }
          ) {
            key
            redirectUri
          }
        }
      `;
      return this.gqlRequest(query);
    },

    getGocardlessConnection: async () => {
      const query = gql`
        {
          gocardlessConnection {
            key
            redirectUri
          }
        }
      `;
      return this.gqlRequest(query);
    },

    listUsers: async () => {
      const query = gql`
        {
          users {
            gocardlessId
            id
            nickname
          }
        }
      `;
      return this.gqlRequest(query);
    },
  };

  user = {
    me: async () => {
      let query = gql`
        {
          me {
            gocardlessId
            id
            nickname
            address {
              line1
              line2
              town
              postcode
            }
          }
        }
      `;
      return this.gqlRequest(query);
    },

    setNickname: async (nickname: string | null) => {
      const query = gql`
          mutation {
            setNickname(nickname: ${quoteString(nickname)}) {
              id
              nickname
            }
          }
        `;
      return this.gqlRequest(query);
    },

    setAddress: async (address: {
      line1: string | null | undefined;
      line2: string | null | undefined;
      town: string | null | undefined;
      postcode: string | null | undefined;
    }) => {
      const query = gql`
        mutation {
          setAddress(
            address: {
              ${
                address.line1 === undefined
                  ? ''
                  : 'line1: ' + quoteString(address.line1)
              }
              ${
                address.line2 === undefined
                  ? ''
                  : 'line2: ' + quoteString(address.line2)
              }
              ${
                address.town === undefined
                  ? ''
                  : 'town: ' + quoteString(address.town)
              }
              ${
                address.postcode === undefined
                  ? ''
                  : 'postcode: ' + quoteString(address.postcode)
              }
            }
          ) {
            id
            address {
              line1
              line2
              town
              postcode
            }
          }
        }
      `;
      return this.gqlRequest(query);
    },
  };
}
