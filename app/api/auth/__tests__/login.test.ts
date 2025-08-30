/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler';
import * as loginHandler from '@/app/api/auth/login/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  signJwt: jest.fn(),
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully log in a user with valid credentials', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'STUDENT',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signJwt as jest.Mock).mockReturnValue('mock-jwt-token');

    await testApiHandler({
      appHandler: loginHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.user.email).toBe(mockUser.email);
        expect(response.headers.get('set-cookie')).toContain('token=mock-jwt-token');
      },
    });
  });

  it('should return a 401 error for a non-existent user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await testApiHandler({
      appHandler: loginHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ email: 'no@user.com', password: 'password' }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it('should return a 401 error for an invalid password', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'STUDENT',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await testApiHandler({
      appHandler: loginHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it('should return a 400 error for invalid input', async () => {
    await testApiHandler({
      appHandler: loginHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ email: 'bad-email', password: '' }),
        });
        expect(res.status).toBe(400);
      },
    });
  });
});
