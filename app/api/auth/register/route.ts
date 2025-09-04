import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const registerUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  // ✅ FIXED: Removed 'OFFICER' to match the Prisma schema exactly.
  role: z.enum(['STUDENT', 'HR', 'ADMIN']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ✅ ADDED: Temporary log for getting the admin password hash.
    // Follow the step-by-step guide to use this.
    console.log(`--- PASSWORD HASH FOR ${email} ---`);
    console.log(hashedPassword);
    console.log("--- COPY THE HASH ABOVE ---");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
      },
    });

    return NextResponse.json({
      success: true,
      user: { name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}