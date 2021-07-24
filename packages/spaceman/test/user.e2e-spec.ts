import { TestClient } from './utils/client';

describe('Spaceman', () => {
  const client: TestClient = new TestClient();

  beforeEach(async () => {
    process.env.ROLES_CLAIM = client.auth.rolesClaim;
    await client.setup();
  });

  afterEach(async () => {
    await client.teardown();
  });

  describe('User Management', () => {
    describe('Nickname', () => {
      it('should let a user set their nickname', async () => {
        const result = await client.user.setNickname('Jim');
        expect(result.status).toBe(200);
        expect(result.body).toMatchObject({
          data: {
            setNickname: {
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: 'Jim',
            },
          },
        });
        const result2 = await client.user.me();
        expect(result2.status).toBe(200);
        expect(result2.body).toMatchObject({
          data: {
            me: {
              gocardlessId: null,
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: 'Jim',
              address: null,
            },
          },
        });
      });

      it('should let a user change their nickname', async () => {
        const result = await client.user.setNickname('Jim');
        expect(result.status).toBe(200);
        const result2 = await client.user.setNickname('Jim2');
        expect(result2.status).toBe(200);
        const result3 = await client.user.me();
        expect(result3.status).toBe(200);
        expect(result3.body).toMatchObject({
          data: {
            me: {
              gocardlessId: null,
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: 'Jim2',
              address: null,
            },
          },
        });
      });

      it('should let a user clear their nickname', async () => {
        const result = await client.user.setNickname('Jim');
        expect(result.status).toBe(200);
        const result2 = await client.user.setNickname(null);
        expect(result2.status).toBe(200);
        const result3 = await client.user.me();
        expect(result3.status).toBe(200);
        expect(result3.body).toMatchObject({
          data: {
            me: {
              gocardlessId: null,
              id: expect.stringMatching(/^[0-9]{1,5}$/),
              nickname: null,
              address: null,
            },
          },
        });
      });
    });

    describe('Address', () => {
      it('should start a user with no address', async () => {
        const result = await client.user.me();
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
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
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

        const result2 = await client.user.me();
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

      it('should allow line 2 to be null', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: null,
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
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

        const result2 = await client.user.me();
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
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(200);

        const result2 = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: null,
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
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

        const result3 = await client.user.me();
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

      it('should not allow line1 to be omitted', async () => {
        const result = await client.user.setAddress({
          line1: undefined,
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Field "SetAddressInput.line1" of required type "String!" was not provided.',
        );
      });

      it('should not allow line1 to be null', async () => {
        const result = await client.user.setAddress({
          line1: null,
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Expected value of type "String!", found null.',
        );
      });

      it('should allow line2 to be omitted', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: undefined,
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
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
      });

      it('should not allow town to be omitted', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: undefined,
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Field "SetAddressInput.town" of required type "String!" was not provided.',
        );
      });

      it('should not allow town to be null', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: null,
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Expected value of type "String!", found null.',
        );
      });

      it('should not allow postcode to be omitted', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: undefined,
        });
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Field "SetAddressInput.postcode" of required type "String!" was not provided.',
        );
      });

      it('should not allow postcode to be null', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: null,
        });
        expect(result.status).toBe(400);
        expect(result.body.errors[0].message).toBe(
          'Expected value of type "String!", found null.',
        );
      });

      it('should allow not allow line1 to be greater than 255 characters', async () => {
        const result = await client.user.setAddress({
          line1:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const result2 = await client.user.setAddress({
          line1:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });

      it('should allow not allow line2 to be greater than 255 characters', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const result2 = await client.user.setAddress({
          line1: '123 Fake Street',
          line2:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          town: 'Anytown',
          postcode: 'TS2 1RT',
        });
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });

      it('should allow not allow town to be greater than 255 characters', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          postcode: 'TS2 1RT',
        });
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const result2 = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          postcode: 'TS2 1RT',
        });
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });

      it('should allow not allow postcode to be greater than 10 characters', async () => {
        const result = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS999 10RT',
        });
        expect(result.status).toBe(200);
        expect(result.body.errors).not.toBeDefined();

        const result2 = await client.user.setAddress({
          line1: '123 Fake Street',
          line2: 'Some Village',
          town: 'Anytown',
          postcode: 'TS999 100RT',
        });
        expect(result2.status).toBe(200);
        expect(result2.body.errors[0].message).toBe('Bad Request Exception');
      });
    });
  });
});
