/**
 * @jest-environment node
 */

import { testApiHandler } from "next-test-api-route-handler";
import * as usersHandler from "@/app/api/admin/users/route";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Mock JWT verification
jest.mock("@/lib/auth", () => ({
  verifyJwt: jest.fn(),
}));

// Mock cookies from next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { cookies } from "next/headers";

describe("GET /api/admin/users", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // silence error logs
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if user is not admin", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: "fake-token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue({ role: "STUDENT" });

    await testApiHandler({
      appHandler: usersHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toBe("Forbidden");
      },
    });
  });

  it("should return list of users for admin", async () => {
    const mockUsers = [
      { id: "1", name: "Alice", email: "alice@example.com", role: "ADMIN", createdAt: new Date() },
      { id: "2", name: "Bob", email: "bob@example.com", role: "STUDENT", createdAt: new Date() },
    ];

    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: "admin-token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue({ role: "ADMIN" });
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    await testApiHandler({
      appHandler: usersHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(2);
        expect(body[0].email).toBe("alice@example.com");
        expect(body[1].role).toBe("STUDENT");
      },
    });
  });

  it("should return 500 if Prisma throws", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: "admin-token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue({ role: "ADMIN" });
    (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await testApiHandler({
      appHandler: usersHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Could not fetch users");
      },
    });
  });
});
