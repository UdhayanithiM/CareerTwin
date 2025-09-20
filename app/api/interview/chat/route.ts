import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// 1. Initialize Google model
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!, // make sure this is in your .env
});

const model = google("models/gemini-1.5-pro"); // you can change to gemini-1.5-flash if needed

// 2. Handle POST requests
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 3. Call AI stream
    const result = await streamText({
      model,
      messages,
    });

    // 4. Return as streaming response
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
