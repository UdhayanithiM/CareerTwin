import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Authentication token not found. Please log in.' }, { status: 401 });
  }

  const decoded = verifyJwt(accessToken);

  if (!decoded || typeof decoded.id !== 'string') { // ✅ FIXED
    return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 });
  }

  const userId = decoded.id; // ✅ FIXED

  try {
    const assessments = await prisma.assessment.findMany({
      where: { candidateId: userId },
      include: {
        technicalAssessment: true,
        report: true,
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
