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
    const hrId = payload.id as string;

    if (role !== 'HR' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { candidateId, questionIds } = body;

    if (!candidateId || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'Invalid input: candidateId and questionIds are required.' }, { status: 400 });
    }

    // --- THIS IS THE CORRECTED LOGIC ---
    // We now create the main assessment, the technical part, AND the behavioral part
    // all at once, ensuring the entire process is linked from the start.
    const newAssessment = await prisma.assessment.create({
      data: {
        candidateId: candidateId,
        hrId: hrId,
        status: 'PENDING', // The overall status is pending
        // Create the nested TechnicalAssessment
        technicalAssessment: {
          create: {
            status: 'NOT_STARTED', // The technical test has not been started
            questionIds: questionIds,
          },
        },
        // ALSO Create the nested BehavioralInterview
        behavioralInterview: {
            create: {
                status: 'LOCKED', // The interview is locked until the technical part is passed
            }
        }
      },
    });

    return NextResponse.json({ success: true, assessment: newAssessment }, { status: 201 });

  } catch (error) {
    if (error instanceof Error && error.name === 'JWTExpired') {
        return NextResponse.json({ error: 'Unauthorized: Token has expired.' }, { status: 401 });
    }
    
    console.error('Failed to create assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
