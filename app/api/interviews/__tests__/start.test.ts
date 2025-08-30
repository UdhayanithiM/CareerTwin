/**
 * @jest-environment node
 */

import { testApiHandler } from "next-test-api-route-handler";
import * as startHandler from "@/app/api/interviews/start/route"; // <-- point to your real route file
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { cookies } from "next/headers";

// --- Mocks ---
jest.mock("@/lib/prisma", () => ({
  prisma: {
    interview: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  verifyJwt: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// 👇 Silence noisy console logs/errors for clean test output
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

describe("POST /api/interviews/start", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no token in cookies", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    await testApiHandler({
      appHandler: startHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "POST" });
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.error).toMatch(/Missing authentication token/);
      },
    });
  });

  it("should return 403 if token is invalid", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "bad.token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue(null);

    await testApiHandler({
      appHandler: startHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "POST" });
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.error).toMatch(/Invalid token/);
      },
    });
  });

  it("should return 403 if role is not STUDENT", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "valid.token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue({ id: "user1", role: "HR" });

    await testApiHandler({
      appHandler: startHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "POST" });
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.error).toMatch(/do not have permission/);
      },
    });
  });

  it("should create interview successfully if role is STUDENT", async () => {
    const mockInterview = {
      id: "int1",
      candidateId: "student1",
      status: "in-progress",
      questions: [
        { id: "q1", text: "Q1" },
        { id: "q2", text: "Q2" },
      ],
    };

    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "valid.token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue({ id: "student1", role: "STUDENT" });
    (prisma.interview.create as jest.Mock).mockResolvedValue(mockInterview);

    await testApiHandler({
      appHandler: startHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "POST" });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.id).toBe("int1");
        expect(body.questions).toHaveLength(2);
      },
    });
  });

  it("should return 500 if prisma throws", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "valid.token" }),
    });
    (verifyJwt as jest.Mock).mockReturnValue({ id: "student1", role: "STUDENT" });
    (prisma.interview.create as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await testApiHandler({
      appHandler: startHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "POST" });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.error).toMatch(/database error/);
      },
    });
  });
});
