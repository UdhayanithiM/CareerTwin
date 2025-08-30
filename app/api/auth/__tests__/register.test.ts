/**
 * @jest-environment node
 */

import { testApiHandler } from "next-test-api-route-handler";
import * as registerHandler from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

// 👇 Silence console.error just for these tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully register a new user", async () => {
    const mockUser = {
      id: "1",
      name: "New User",
      email: "new@example.com",
      password: "hashedpassword123",
      role: "STUDENT",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword123");
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "New User",
            email: "new@example.com",
            password: "password123",
            role: "STUDENT",
          }),
        });

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.user.email).toBe(mockUser.email);
        expect(body.user.role).toBe("STUDENT");
      },
    });
  });

  it("should return 400 for invalid input", async () => {
    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          body: JSON.stringify({ email: "bad", password: "" }),
        });

        expect(res.status).toBe(400);
      },
    });
  });

  it("should return 409 if user already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "1",
      email: "exists@example.com",
    });

    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          body: JSON.stringify({
            name: "Exists",
            email: "exists@example.com",
            password: "password123",
            role: "HR",
          }),
        });

        expect(res.status).toBe(409);
      },
    });
  });

  it("should return 500 if Prisma throws", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));

    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          body: JSON.stringify({
            name: "Broken",
            email: "broken@example.com",
            password: "password123",
            role: "ADMIN",
          }),
        });

        expect(res.status).toBe(500);
      },
    });
  });
});
