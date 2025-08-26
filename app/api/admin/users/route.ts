import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export async function GET() {
  // Although middleware protects this, we can add an extra layer of security
  const token = cookies().get('token');
  const payload = token ? verifyJwt(token.value) : null;
  if (payload?.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      // IMPORTANT: Exclude the password field for security
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: 'Could not fetch users' }, { status: 500 });
  }
}
