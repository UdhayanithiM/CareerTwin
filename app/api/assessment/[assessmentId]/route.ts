import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route to fetch details for a specific assessment,
 * including the coding question.
 */
export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;

    // In a real scenario, you'd fetch the assessment and its linked question.
    // For now, to keep moving, we'll fetch the assessment ID from the URL
    // and pair it with the FIRST coding question we find in the database.
    
    // This simulates fetching an assigned assessment.
    console.log(`Fetching data for assessment ID: ${assessmentId}`);
    
    const codingQuestion = await prisma.codingQuestion.findFirst({
      // We are just getting the first one for now.
      // Later, you'd add a where clause based on the actual assessment.
    });

    if (!codingQuestion) {
      return NextResponse.json({ error: 'No coding questions found in the database.' }, { status: 404 });
    }

    // We return the question and pass along the assessmentId for the frontend.
    return NextResponse.json({
      assessmentId,
      question: codingQuestion,
    });

  } catch (error) {
    console.error('Failed to fetch assessment data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching assessment data.' },
      { status: 500 }
    );
  }
}