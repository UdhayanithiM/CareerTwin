import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; // <-- Import Zod

// 1. Define a schema for the expected request body
const submitAnswerSchema = z.object({
  questionId: z.string().min(1, { message: "Question ID is required." }),
  answer: z.string().min(1, { message: "Answer cannot be empty." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 2. Validate the request body against the schema
    const validation = submitAnswerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { questionId, answer } = validation.data;

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        answer: answer,
        // We will add the LLM evaluation here in Phase 3
      },
    });

    // In Phase 3, we will call the LLM API here and return its feedback.
    // For now, we just confirm success.
    return NextResponse.json({ success: true, question: updatedQuestion });

  } catch (error) {
    console.error("Failed to submit answer:", error);
    return NextResponse.json({ error: 'Could not submit answer' }, { status: 500 });
  }
}