import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for validating the incoming request body
const submissionSchema = z.object({
  assessmentId: z.string().nonempty('Assessment ID is required.'),
  questionId: z.string().nonempty('Question ID is required.'),
  code: z.string().nonempty('Code submission cannot be empty.'),
  language: z.string().nonempty('Language is required.'),
});

/**
 * API Route to handle code submissions from technical assessments.
 * This function will:
 * 1. Validate the incoming data.
 * 2. Retrieve the correct test cases for the question.
 * 3. (Simulate) Call an external code execution engine (like Piston API).
 * 4. Save the results and the submitted code to the database.
 */
export async function POST(request: Request) {
  try {
    // 1. Validate the request body
    const body = await request.json();
    const validation = submissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body.', details: validation.error.flatten() }, { status: 400 });
    }

    const { assessmentId, questionId, code, language } = validation.data;

    // 2. Fetch the question and its test cases from the database
    const question = await prisma.codingQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Coding question not found.' }, { status: 404 });
    }

    // --- 3. (Simulated) Piston API Call ---
    // In a real application, you would make a `fetch` call here to the Piston API
    // with the `code`, `language`, and `question.testCases`.
    // For this simulation, we'll just pretend the evaluation happened.
    console.log('--- SIMULATING CODE EVALUATION ---');
    console.log(`Language: ${language}`);
    console.log(`Code:\n${code}`);
    console.log('Test Cases:', question.testCases);
    
    // Let's create a simulated result
    const simulatedResults = {
      passCount: 2,
      totalCount: 3,
      // In a real scenario, this would contain detailed output for each test case
      details: 'Simulated result: 2 out of 3 test cases passed.', 
    };
    // --- End of Simulation ---


    // 4. Update the TechnicalAssessment in the database with the results
    const updatedAssessment = await prisma.technicalAssessment.update({
      where: {
        assessmentId: assessmentId,
      },
      data: {
        code: code,
        language: language,
        status: 'evaluated',
        completedAt: new Date(),
        evaluationResults: simulatedResults, // Storing our simulated results
      },
    });

    return NextResponse.json({
      message: 'Submission evaluated successfully.',
      results: updatedAssessment.evaluationResults,
    });

  } catch (error) {
    console.error('Failed to process submission:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the submission.' },
      { status: 500 }
    );
  }
}