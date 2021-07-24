import { TestClient } from './utils/client';

describe('Auth', () => {
  const client: TestClient = new TestClient();

  beforeEach(async () => {
    process.env.ROLES_CLAIM = client.auth.rolesClaim;
    await client.setup();
  });

  afterEach(async () => {
    await client.teardown();
  });

  it('should return a user record given a valid token', async () => {
    const result = await client.user.me();
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
    client.auth.sub = undefined;
    const result = await client.user.me();
    expect(result.status).toBe(200);
    expect(result.body.errors.length).toBe(1);
    expect(result.body.errors[0].message).toBe('User is not authenticated');
  });

  it('should return different IDs for different users', async () => {
    const result = await client.user.me();
    expect(result.status).toBe(200);
    const user1Id = result.body.data.me.id;
    client.auth.sub = 'foo';
    const result2 = await client.user.me();
    expect(result.status).toBe(200);
    expect(result2.body.data.me.id).not.toBe(user1Id);
  });

  it('should return the same IDs for the same user', async () => {
    const result = await client.user.me();
    expect(result.status).toBe(200);
    const user1Id = result.body.data.me.id;
    const result2 = await client.user.me();
    expect(result.status).toBe(200);
    expect(result2.body.data.me.id).toBe(user1Id);
  });
});
