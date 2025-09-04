// app/api/admin/questions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod schema to validate the test cases JSON structure
const testCaseSchema = z.object({
  input: z.any(),
  expected: z.any(),
});

// Zod schema for validating the incoming request body for a new question
const codingQuestionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  // Validates that testCases is a non-empty array of our testCaseSchema
  testCases: z.array(testCaseSchema).min(1, "At least one test case is required"),
});

// GET handler to fetch all coding questions
export async function GET() {
  try {
    const questions = await prisma.codingQuestion.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Could not fetch coding questions" },
      { status: 500 }
    );
  }
}

// POST handler to create a new coding question
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = codingQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // jobRoleId is removed as it's not in the new schema
    const { title, description, difficulty, testCases } = validation.data;

    const newQuestion = await prisma.codingQuestion.create({
      data: {
        title,
        description,
        difficulty,
        testCases, // Prisma handles the JSON conversion automatically
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Could not create coding question" },
      { status: 500 }
    );
  }
}