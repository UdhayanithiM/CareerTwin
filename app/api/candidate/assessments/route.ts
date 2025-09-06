import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt, UserJwtPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication token not found. Please log in.' }, { status: 401 });
  }

  const decoded: UserJwtPayload | null = await verifyJwt(token);

  if (!decoded || typeof decoded.id !== 'string') {
    return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 });
  }

  const userId = decoded.id;

  try {
    const assessments = await prisma.assessment.findMany({
      where: { candidateId: userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        technicalAssessment: {
          select: {
            id: true,
            status: true,
            evaluationResults: true,
            // --- ADD THIS LINE ---
            score: true, // This will now include the score in the API response
          }
        },
        behavioralInterview: { // Also select this to help differentiate assessment types
            select: {
                id: true,
            }
        },
        report: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Failed to fetch candidate assessments:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching your assessments.' },
      { status: 500 }
    );
  }
}
