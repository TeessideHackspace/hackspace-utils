import { ExecutionContext, INestApplication } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import request from 'supertest';

export const gqlRequest = function (app: INestApplication, query: string) {
  return request(app.getHttpServer()).post('/graphql').send({
    query: query,
  });
};

export class TestAuthContext {
  rolesClaim: string = 'http://example.com/roles';
  sub: string | undefined = 'default';
  roles: string[] = [];

  reset() {
    this.sub = 'default';
    this.roles = [];
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
