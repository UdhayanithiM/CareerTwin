// app/api/hr/assessments/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const role = (payload.role as string)?.toUpperCase();
    const hrId = payload.id as string; // Get the HR user's ID from the token

    // Ensure only HR users can create assessments
    if (role !== 'HR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { candidateId, questionIds } = body;

    // Validate input
    if (!candidateId || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'Invalid input: candidateId and questionIds are required.' }, { status: 400 });
    }

    // Create the main Assessment record
    const newAssessment = await prisma.assessment.create({
      data: {
        candidateId: candidateId,
        hrId: hrId,
        status: 'PENDING',
        // Create the nested TechnicalAssessment at the same time
        technicalAssessment: {
          create: {
            status: 'NOT_STARTED',
            questionIds: questionIds,
          },
        },
      },
    });

    return NextResponse.json({ success: true, assessment: newAssessment }, { status: 201 });

  } catch (error) {
    // Handle cases where the token is invalid
    if (error instanceof Error && error.name === 'JWTExpired') {
        return NextResponse.json({ error: 'Unauthorized: Token has expired.' }, { status: 401 });
    }
    
    console.error('Failed to create assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}