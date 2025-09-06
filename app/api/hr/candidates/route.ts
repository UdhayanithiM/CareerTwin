//app/api/hr/candidates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt, UserJwtPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication token not found.' }, { status: 401 });
  }

  const decoded: UserJwtPayload | null = await verifyJwt(token);

  // Secure this route for HR and ADMIN roles
  if (!decoded || (decoded.role !== 'HR' && decoded.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Access is denied.' }, { status: 403 });
  }

  try {
    // Fetch all users who are candidates (STUDENT role)
    const candidates = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // Include their assigned assessments
        takenAssessments: {
          orderBy: {
            createdAt: 'desc', // Get the most recent one first
          },
          take: 1, // We only need the latest assessment for the dashboard overview
          select: {
            id: true,
            status: true,
            // Include the technical part to get the score
            technicalAssessment: {
              select: {
                score: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Failed to fetch HR candidates data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching candidate data.' },
      { status: 500 }
    );
  }
}
