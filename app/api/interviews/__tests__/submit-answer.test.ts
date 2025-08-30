/**
 * @jest-environment node
 */

import { testApiHandler } from "next-test-api-route-handler";
import * as submitHandler from "@/app/api/interviews/submit-answer/route"; // <-- point to actual route
import { prisma } from "@/lib/prisma";

// --- Mock Prisma ---
jest.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      update: jest.fn(),
    },
  },
}));

// Silence logs in test output
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe("POST /api/interviews/submit-answer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a question with the submitted answer", async () => {
    const mockQuestion = {
      id: "q1",
      text: "What is React?",
      answer: "A JS library for UIs",
    };

    (prisma.question.update as jest.Mock).mockResolvedValue(mockQuestion);

    await testApiHandler({
      appHandler: submitHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: "q1",
            answer: "A JS library for UIs",
          }),
        });

        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.question.answer).toBe("A JS library for UIs");
      },
    });
  });

  it("should return 400 if input validation fails", async () => {
    await testApiHandler({
      appHandler: submitHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: "", answer: "" }),
        });

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Invalid input");
      },
    });
  });

  it("should return 500 if prisma throws an error", async () => {
    (prisma.question.update as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await testApiHandler({
      appHandler: submitHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: "q1",
            answer: "Something",
          }),
        });

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toMatch(/Could not submit answer/);
      },
    });
  });
});
