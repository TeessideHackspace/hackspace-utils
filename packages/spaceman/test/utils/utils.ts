import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const gqlRequest = function (app: INestApplication, query: string) {
  return request(app.getHttpServer()).post('/graphql').send({
    query: query,
  });
};
