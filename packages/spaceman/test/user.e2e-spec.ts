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
    await userRepository.query(`DELETE FROM "address";`);
    await app.close();
  });

  describe('User Management', () => {
    describe('Nickname', () => {
      it('should let a user set their nickname', async () => {
        const mutation = gql`
          mutation {
            setNickname(nickname: "Jim") {
              id
              nickname
            }
          }
        `;
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body).toMatchObject({
          data: {
            setNickname: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: 'Jim',
            },
          },
        });
        const query = gql`
          {
            me {
              id
              nickname
            }
          }
        `;
        const result2 = await gqlRequest(app, query);
        expect(result2.status).toBe(200);
        expect(result2.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: 'Jim',
            },
          },
        });
      });

      it('should let a user change their nickname', async () => {
        const mutation = gql`
          mutation {
            setNickname(nickname: "Jim") {
              id
              nickname
            }
          }
        `;
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        const mutation2 = gql`
          mutation {
            setNickname(nickname: "Jim2") {
              id
              nickname
            }
          }
        `;
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);

        const query = gql`
          {
            me {
              id
              nickname
            }
          }
        `;
        const result3 = await gqlRequest(app, query);
        expect(result3.status).toBe(200);
        expect(result3.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: 'Jim2',
            },
          },
        });
      });

      it('should let a user clear their nickname', async () => {
        const mutation = gql`
          mutation {
            setNickname(nickname: "Jim") {
              id
              nickname
            }
          }
        `;
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        const mutation2 = gql`
          mutation {
            setNickname(nickname: null) {
              id
              nickname
            }
          }
        `;
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);

        const query = gql`
          {
            me {
              id
              nickname
            }
          }
        `;
        const result3 = await gqlRequest(app, query);
        expect(result3.status).toBe(200);
        expect(result3.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: null,
            },
          },
        });
      });
    });

    describe('Address', () => {
      it('should start a user with no address', async () => {
        const query = gql`
          {
            me {
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
        const result = await gqlRequest(app, query);
        expect(result.status).toBe(200);
        expect(result.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: null,
            },
          },
        });
      });

      it('should allow a user to set their address', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body).toMatchObject({
          data: {
            setAddress: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: 'Some Village',
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });

        const query = gql`
          {
            me {
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
        const result2 = await gqlRequest(app, query);
        expect(result2.status).toBe(200);
        expect(result2.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: 'Some Village',
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });
      });

      it('should allow line 2 to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body).toMatchObject({
          data: {
            setAddress: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: null,
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });

        const query = gql`
          {
            me {
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
        const result2 = await gqlRequest(app, query);
        expect(result2.status).toBe(200);
        expect(result2.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: null,
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });
      });

      it('should allow line 2 to be null', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: null
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body).toMatchObject({
          data: {
            setAddress: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: null,
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });

        const query = gql`
          {
            me {
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
        const result2 = await gqlRequest(app, query);
        expect(result2.status).toBe(200);
        expect(result2.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: null,
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });
      });

      it('should allow line 2 to be updated to be null', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);

        const mutation2 = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: null
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);

        expect(result2.body).toMatchObject({
          data: {
            setAddress: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: null,
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });

        const query = gql`
          {
            me {
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
        const result3 = await gqlRequest(app, query);
        expect(result3.status).toBe(200);
        expect(result3.body).toMatchObject({
          data: {
            me: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              address: {
                line1: '123 Fake Street',
                line2: null,
                town: 'Anytown',
                postcode: 'TS2 1RT',
              },
            },
          },
        });
      });

      it('should allow not allow line1 to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Field "SetAddressInput.line1" of required type "String!" was not provided.',
        );
      });

      it('should allow not allow line1 to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: null
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Expected value of type "String!", found null.',
        );
      });

      it('should allow not allow town to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Field "SetAddressInput.town" of required type "String!" was not provided.',
        );
      });

      it('should allow not allow town to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: null
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Expected value of type "String!", found null.',
        );
      });

      it('should allow not allow postcode to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "Anytown"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Field "SetAddressInput.postcode" of required type "String!" was not provided.',
        );
      });

      it('should allow not allow postcode to be omitted', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "Anytown"
                postcode: null
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Expected value of type "String!", found null.',
        );
      });

      it('should allow not allow line1 to be greater than 255 characters', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const mutation2 = gql`
          mutation {
            setAddress(
              address: {
                line1: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });

      it('should allow not allow line2 to be greater than 255 characters', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const mutation2 = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                town: "Anytown"
                postcode: "TS2 1RT"
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
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });

      it('should allow not allow town to be greater than 255 characters', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                postcode: "TS2 1RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const mutation2 = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                postcode: "TS2 1RT"
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
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });

      it('should allow not allow postcode to be greater than 10 characters', async () => {
        const mutation = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS999 10RT"
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
        const result = await gqlRequest(app, mutation);
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const mutation2 = gql`
          mutation {
            setAddress(
              address: {
                line1: "123 Fake Street"
                line2: "Some Village"
                town: "Anytown"
                postcode: "TS999 10RT1"
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
        const result2 = await gqlRequest(app, mutation2);
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });
    });
  });
});
