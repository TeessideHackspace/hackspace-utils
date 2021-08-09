import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/graphql/auth/jwt-auth.guard';
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
  public repository?: Repository<any>;
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

    //@ts-ignore
    this.app.appOptions = { bodyParser: false };
    this.app.useGlobalPipes(new ValidationPipe());
    await this.app.init();
  }

  async teardown() {
    this.auth.reset();
    await this.repository!.query(`DELETE FROM "user";`);
    await this.repository!.query(`DELETE FROM "address";`);
    await this.repository!.query(`DELETE FROM "keycloakConnection";`);
    await this.repository!.query(`DELETE FROM "gocardlessConnection";`);
    await this.repository!.query(`DELETE FROM "sesConnection";`);
    await this.repository!.query(`DELETE FROM "globalSettings";`);
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
    setGlobalSettings: async (siteName: string, adminEmail: string) => {
      const query = gql`
        mutation {
          setGlobalSettings(
            input: { siteName: "${siteName}", adminEmail: "${adminEmail}"}
          ) {
            siteName
            adminEmail
          }
        }
      `;
      return this.gqlRequest(query);
    },

    getGlobalSettings: async () => {
      const query = gql`
        {
          globalSettings {
            siteName
            adminEmail
          }
        }
      `;
      return this.gqlRequest(query);
    },

    setGocardlessConnection: async (
      key: string,
      redirectUri: string,
      webhookSecret: string,
    ) => {
      const query = gql`
        mutation {
          setGocardlessConnection(
            connection: { key: "${key}", redirectUri: "${redirectUri}", webhookSecret: "${webhookSecret}"}
          ) {
            key
            redirectUri
            webhookSecret
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
            webhookSecret
          }
        }
      `;
      return this.gqlRequest(query);
    },

    setKeycloakConnection: async (
      keycloakBaseUrl: string,
      keycloakAdminUsername: string,
      keycloakAdminPassword: string,
    ) => {
      const query = gql`
        mutation {
          setKeycloakConnection(
            input: { keycloakBaseUrl: "${keycloakBaseUrl}", keycloakAdminUsername: "${keycloakAdminUsername}", keycloakAdminPassword: "${keycloakAdminPassword}"}
          ) {
            keycloakBaseUrl
            keycloakAdminUsername
            keycloakAdminPassword
          }
        }
      `;
      return this.gqlRequest(query);
    },

    getKeycloakConnection: async () => {
      const query = gql`
        {
          keycloakConnection {
            keycloakBaseUrl
            keycloakAdminUsername
            keycloakAdminPassword
          }
        }
      `;
      return this.gqlRequest(query);
    },

    setSesConnection: async (
      awsRegion: string,
      awsAccessKeyId: string,
      awsSecretAccessKey: string,
    ) => {
      const query = gql`
        mutation {
          setSesConnection(
            connection: { awsRegion: "${awsRegion}", awsAccessKeyId: "${awsAccessKeyId}", awsSecretAccessKey: "${awsSecretAccessKey}"}
          ) {
            awsRegion
            awsAccessKeyId
            awsSecretAccessKey
          }
        }
      `;
      return this.gqlRequest(query);
    },

    getSesConnection: async () => {
      const query = gql`
        {
          sesConnection {
            awsRegion
            awsAccessKeyId
            awsSecretAccessKey
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
