// app/api/interview/analyze-answer/route.ts
import { NextRequest, NextResponse } from "next/server";
// ✨ We now use Gemini for nuanced analysis
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// ✨ A much richer schema for detailed behavioral feedback
const behavioralAnalysisSchema = z.object({
  sentimentScore: z.number().min(-1).max(1),
  confidenceScore: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
  keywords: z.array(z.string()).max(5),
  feedbackTip: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { text, interviewContext } = await req.json();
    if (!text || !interviewContext) {
      return NextResponse.json({ error: "Answer text and context are required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest", // Using the best model for analysis
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      You are an expert interview coach analyzing a single answer from a candidate.
      The interview is for a "${interviewContext}" role.
      Analyze the following candidate's answer for sentiment, confidence, clarity, and key skills mentioned.

      Provide a short, one-sentence feedback tip (e.g., "Good use of the STAR method," or "Try to be more concise.").

      Your response MUST be a JSON object that strictly adheres to this structure:
      {
        "sentimentScore": "A float between -1.0 (very negative) and 1.0 (very positive).",
        "confidenceScore": "An integer between 0 and 100 representing how confident the answer sounds.",
        "clarityScore": "An integer between 0 and 100 representing how clear and easy to understand the answer is.",
        "keywords": ["An array of up to 5 most important technical or soft skills mentioned."],
        "feedbackTip": "A single, concise string of actionable advice for the candidate."
      }

      Candidate's Answer:
      ---
      ${text}
      ---
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedObject = JSON.parse(responseText);
    const validation = behavioralAnalysisSchema.safeParse(parsedObject);

    if (!validation.success) {
      console.error("Zod validation failed for analysis. AI Response:", parsedObject, validation.error.flatten());
      throw new Error("AI model returned an invalid analysis shape.");
    }

    return NextResponse.json(validation.data);

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: "Failed to analyze answer." }, { status: 500 });
  }
}