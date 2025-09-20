// app/api/interview/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Zod schema for a structured, actionable feedback report
const feedbackSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).min(2),
  areasForImprovement: z.array(z.string()).min(2),
});

export async function POST(req: NextRequest) {
  try {
    const { messages, interviewContext } = await req.json();

    if (!messages || !interviewContext) {
      return NextResponse.json({ error: "Interview transcript and context are required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    // Convert the message history into a simple transcript format
    const transcript = messages
      .map((msg: { role: string, content: string }) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join("\n");

    const prompt = `
      You are an expert AI Career Coach reviewing an interview transcript. The interview was for a "${interviewContext}" role.
      Analyze the entire transcript provided below and generate a final feedback report.

      Your response MUST be a JSON object that strictly adheres to the following structure:
      {
        "overallScore": "An integer score from 0 to 100 representing the candidate's overall performance.",
        "summary": "A brief, 2-3 sentence summary of the candidate's performance.",
        "strengths": ["An array of at least 2 strings highlighting what the candidate did well."],
        "areasForImprovement": ["An array of at least 2 strings with constructive advice on what to improve."]
      }

      Transcript:
      ---
      ${transcript}
      ---
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedObject = JSON.parse(responseText);
    const validation = feedbackSchema.safeParse(parsedObject);

    if (!validation.success) {
      console.error("Zod validation failed. AI Response:", parsedObject);
      console.error("Validation Errors:", validation.error.flatten());
      throw new Error("AI model returned an object with an invalid shape.");
    }

    return NextResponse.json(validation.data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Feedback API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}