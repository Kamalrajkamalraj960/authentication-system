import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import User from '../src/models/user.model.js';
import { ROLES } from '../src/constants/index.js';

const app = createApp();

const validUser = { name: 'Jane Doe', email: 'jane@example.com', password: 'Passw0rd!' };

/** Register + login helper returning the access token and Set-Cookie header. */
const registerAndLogin = async (overrides = {}) => {
  const creds = { ...validUser, ...overrides };
  await request(app).post('/api/auth/register').send(creds);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: creds.email, password: creds.password });
  return { res, accessToken: res.body.data.accessToken, cookies: res.headers['set-cookie'] };
};

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user and hashes the password', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');

      const dbUser = await User.findOne({ email: validUser.email }).select('+password');
      expect(dbUser.password).toBeDefined();
      expect(dbUser.password).not.toBe(validUser.password);
    });

    it('rejects duplicate emails with 409', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(409);
    });

    it('rejects weak passwords with 422', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'weak' });
      expect(res.status).toBe(422);
      expect(res.body.data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('logs in with valid credentials and sets cookies', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      const cookies = res.headers['set-cookie'].join(';');
      expect(cookies).toMatch(/accessToken/);
      expect(cookies).toMatch(/refreshToken/);
      expect(cookies).toMatch(/HttpOnly/i);
    });

    it('rejects wrong password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'WrongPass1!' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user with a valid token', async () => {
      const { accessToken } = await registerAndLogin();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('rotates the refresh token and issues a new access token', async () => {
      const { cookies } = await registerAndLogin();
      const res = await request(app).post('/api/auth/refresh').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects a missing refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });
  });

  describe('RBAC: GET /api/admin/users', () => {
    it('forbids regular users with 403 and "Access denied"', async () => {
      const { accessToken } = await registerAndLogin();
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied');
    });

    it('allows admins', async () => {
      const { accessToken } = await registerAndLogin({ email: 'admin@example.com' });
      await User.updateOne({ email: 'admin@example.com' }, { role: ROLES.ADMIN });
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
  });

  describe('Password reset flow', () => {
    it('always returns 200 for forgot-password (no enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nobody@example.com' });
      expect(res.status).toBe(200);
    });
  });
});
