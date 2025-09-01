import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * API Route to fetch all candidate (student) users.
 * This is for the HR Dashboard to get a list of all candidates in the system.
 */
export async function GET() {
  try {
    const candidates = await prisma.user.findMany({
      where: {
        role: Role.STUDENT,
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
      { error: 'An error occurred while fetching candidates.' },
      { status: 500 }
    );
  }
}