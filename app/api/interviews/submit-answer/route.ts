import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { questionId, answer } = await request.json();

    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Question ID and answer are required' }, { status: 400 });
    }

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
