import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

const MOCK_QUESTIONS = [
  "Tell me about a challenging project you worked on.",
  "How do you handle disagreements with team members?",
  "Describe a time you had to learn a new technology quickly.",
];

export async function POST() {
  console.log("\n--- 'Start Interview' API endpoint hit ---");
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    console.log("Error: No token found in cookies.");
    return NextResponse.json({ error: 'Unauthorized: Missing authentication token.' }, { status: 401 });
  }
  console.log("Token found. Verifying...");

  const payload = verifyJwt(token.value);
  
  if (!payload) {
    console.log("Error: Token verification failed or token is invalid.");
    return NextResponse.json({ error: 'Forbidden: Invalid token.' }, { status: 403 });
  }
  console.log("Token verified. Payload:", payload);

  if (payload.role.toUpperCase() !== 'STUDENT') {
    console.log(`Error: User has role '${payload.role}', but 'STUDENT' is required.`);
    return NextResponse.json({ error: 'Forbidden: You do not have permission to start an interview.' }, { status: 403 });
  }
  console.log("User role is STUDENT. Proceeding to create interview...");

  try {
    const newInterview = await prisma.interview.create({
      data: {
        candidateId: payload.id,
        status: 'in-progress',
        questions: {
          create: MOCK_QUESTIONS.map(qText => ({ text: qText })),
        },
      },
      include: {
        questions: true,
      },
    });

    console.log("Successfully created new interview:", newInterview.id);
    return NextResponse.json(newInterview);

  } catch (error) {
    console.error("CRITICAL: Failed to create interview in database.", error);
    return NextResponse.json({ error: 'Could not start interview due to a database error.' }, { status: 500 });
  }
}
