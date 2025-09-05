// app/api/admin/questions/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all coding questions
export async function GET() {
  try {
    const questions = await prisma.codingQuestion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/questions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coding questions" },
      { status: 500 }
    );
  }
}

// POST - create a new coding question
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, difficulty, testCases } = body;

    // Validation
    if (!title || !description || !difficulty || !testCases) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure testCases is valid JSON (array of objects)
    let parsedTestCases;
    try {
      parsedTestCases =
        typeof testCases === "string" ? JSON.parse(testCases) : testCases;
      if (!Array.isArray(parsedTestCases)) {
        throw new Error("Test cases must be an array");
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON format for test cases" },
        { status: 400 }
      );
    }

    // Save into MongoDB
    const newQuestion = await prisma.codingQuestion.create({
      data: {
        title,
        description,
        difficulty,
        testCases: parsedTestCases, // Prisma saves as Json
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/questions error:", error);
    return NextResponse.json(
      { error: "Failed to create coding question" },
      { status: 500 }
    );
  }
}
