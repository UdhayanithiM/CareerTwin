import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt, UserJwtPayload } from '@/lib/auth'; // Assuming UserJwtPayload is exported from auth
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication token not found. Please log in.' }, { status: 401 });
  }

  // ✅ FIX: Wait for the promise to resolve
  const decoded: UserJwtPayload | null = await verifyJwt(token);

  // ✅ FIX: Check the resolved value, not the promise
  if (!decoded || typeof decoded.id !== 'string') {
    return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 });
  }

  const userId = decoded.id;

  try {
    const assessments = await prisma.assessment.findMany({
      where: { candidateId: userId },
      // Your select and orderBy clauses are correct
      select: {
        id: true,
        status: true,
        createdAt: true,
        technicalAssessment: {
          select: {
            id: true,
            status: true,
            evaluationResults: true,
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