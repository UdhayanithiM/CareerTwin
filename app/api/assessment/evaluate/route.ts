import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the test cases for each question.
// In a real application, this would come from a database.
const testCases: { [key: string]: any[] } = {
  "tech-easy-find-max": [
    { input: [[3, 7, 2, 9, 1, 5]], expected: 9 },
    { input: [[-3, -7, -2, -9, -1, -5]], expected: -1 },
    { input: [[5]], expected: 5 },
    { input: [[-1, -2, -3, -4, -5]], expected: -1 },
  ],
  "problem-medium-two-sum": [
    { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { input: [[3, 2, 4], 6], expected: [1, 2] },
    { input: [[3, 3], 6], expected: [0, 1] },
  ],
  // Add test cases for other questions...
};

const evaluateCodeSchema = z.object({
  questionId: z.string(),
  code: z.string().min(1, "Code cannot be empty."),
  language: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = evaluateCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { questionId, code, language } = validation.data;
    const questionTestCases = testCases[questionId];

    if (!questionTestCases) {
      return NextResponse.json({ error: 'Question not found.' }, { status: 404 });
    }
    
    // --- FIX START ---
    // First, try to find the function name using the regular expression.
    const matchResult = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);

    // Check if the match failed or didn't capture the function name.
    if (!matchResult || !matchResult[1]) {
        return NextResponse.json({ error: 'Could not find a valid function name in your code. Please ensure it follows the standard "function functionName(...)" format.' }, { status: 400 });
    }

    const functionName = matchResult[1];
    // --- FIX END ---


    const results = [];

    for (const testCase of questionTestCases) {
      // Construct the full code to be executed, now with the safely extracted function name.
      const testCode = `${code}\n\nconsole.log(JSON.stringify(${functionName}(...${JSON.stringify(testCase.input)})))`;

      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          version: "*",
          files: [{ content: testCode }],
        }),
      });

      const result = await response.json();

      if (result.run.stderr) {
        results.push({ status: 'error', message: result.run.stderr });
      } else {
        try {
          const output = JSON.parse(result.run.stdout);
          const expected = testCase.expected;

          // Simple comparison for now, can be improved for complex data structures
          if (JSON.stringify(output) === JSON.stringify(expected)) {
            results.push({ status: 'passed' });
          } else {
            results.push({ status: 'failed', expected, actual: output });
          }
        } catch (e) {
          results.push({ status: 'error', message: 'Could not parse output from code execution.' });
        }
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Code evaluation error:", error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
