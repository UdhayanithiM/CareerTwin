import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const submissionSchema = z.object({
  assessmentId: z.string().nonempty('Assessment ID is required.'),
  questionIds: z.array(z.string()).nonempty('At least one Question ID is required.'),
  code: z.string().nonempty('Code submission cannot be empty.'),
  language: z.string().nonempty('Language is required.'),
});

async function evaluateCode(questionIds: string[], code: string, language: string) {
  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/assessment/evaluate`
    : `http://localhost:3000/api/assessment/evaluate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionIds, code, language }),
  });

  if (!response.ok) throw new Error('Code evaluation failed');
  return response.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = submissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body.', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { assessmentId, questionIds, code, language } = validation.data;
    const evaluationData = await evaluateCode(questionIds, code, language);

    const totalTestCases = evaluationData.results.reduce(
      (sum: number, q: any) => sum + q.testCases.length,
      0
    );
    const totalPassCount = evaluationData.results.reduce(
      (sum: number, q: any) => sum + q.testCases.filter((t: any) => t.status === 'passed').length,
      0
    );

    const finalResults = {
      passCount: totalPassCount,
      totalCount: totalTestCases,
      details: `Completed: ${totalPassCount} / ${totalTestCases} total test cases passed.`,
      breakdown: evaluationData.results,
    };

    const updatedAssessment = await prisma.technicalAssessment.update({
      where: { assessmentId },
      data: {
        code,
        language,
        status: 'COMPLETED',
        completedAt: new Date(),
        evaluationResults: finalResults,
      },
    });

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({
      message: 'Submission saved and assessment completed successfully.',
      results: updatedAssessment.evaluationResults,
    });
  } catch (error) {
    console.error('Failed to process submission:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the submission.' },
      { status: 500 }
    );
  }
}
