import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const testCaseSchema = z.object({
  input: z.any(),
  expectedOutput: z.any(),
});

const codingQuestionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  testCases: z.array(testCaseSchema).min(1, "At least one test case is required"),
});

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

    const { title, description, difficulty, testCases } = validation.data;

    const newQuestion = await prisma.codingQuestion.create({
      data: {
        title,
        description,
        difficulty,
        testCases,
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