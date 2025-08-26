import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client'; // This import will now work after `npx prisma generate`

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Convert the incoming role to uppercase to match the database enum
    const upperCaseRole = role.toUpperCase() as Role;

    // A safety check to ensure the role is one of the ones we defined in our enum
    if (!Object.values(Role).includes(upperCaseRole)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: upperCaseRole, // Use the corrected, uppercase role
      },
    });

    return NextResponse.json({
      success: true,
      user: { name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Provide a more specific error message if it's a Prisma validation error
    if (error instanceof Error && error.message.includes('Invalid `prisma.user.create()`')) {
        return NextResponse.json({ error: 'Invalid data provided for registration.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
