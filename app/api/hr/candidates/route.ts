import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication token not found.' }, { status: 401 });
  }

  // ✅ FIXED: Added the 'await' keyword to get the result from the Promise
  const decoded = await verifyJwt(token);

  if (!decoded || decoded.role.toUpperCase() !== 'HR') {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  try {
    const candidates = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
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