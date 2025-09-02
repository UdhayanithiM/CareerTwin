// app/api/hr/candidates/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Authentication token not found.' }, { status: 401 });
  }

  const decoded = verifyJwt(accessToken);

  // Ensure the user is authenticated and has the 'HR' role
  if (!decoded || decoded.role !== 'HR') {
    return NextResponse.json({ error: 'Access denied. You must be an HR professional to view this page.' }, { status: 403 });
  }

  try {
    // Fetch all users with the 'STUDENT' role
    const candidates = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      // Select only the necessary fields to send to the client
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // You can include related data here in the future, like so:
        // reports: {
        //   select: { id: true, technicalScore: true }
        // }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching candidate data.' },
      { status: 500 }
    );
  }
}