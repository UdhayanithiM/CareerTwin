//app/api/assessment/[assessmentId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route to fetch the full details for a specific technical assessment,
 * including all of its assigned coding questions.
 */
export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;

    const technicalAssessment = await prisma.technicalAssessment.findFirst({
      where: { 
        assessmentId: assessmentId 
      },
      include: {
        // This includes the related CodingQuestion records
        questions: true,
      },
    });

    if (!technicalAssessment) {
      return NextResponse.json({ error: 'Technical assessment not found.' }, { status: 404 });
    }

    return NextResponse.json(technicalAssessment);

  } catch (error) {
    console.error('Failed to fetch assessment data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching assessment data.' },
      { status: 500 }
    );
  }
}