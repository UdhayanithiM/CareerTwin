// app/api/interview/analyze-answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { LanguageServiceClient } from "@google-cloud/language";

// Make sure your Google Cloud credentials are set up in your environment
// (e.g., GOOGLE_APPLICATION_CREDENTIALS)
const languageClient = new LanguageServiceClient();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Answer text is required." }, { status: 400 });
    }

    const document = {
      content: text,
      type: "PLAIN_TEXT" as const,
    };

    // Run sentiment and entity analysis in parallel
    const [sentimentResult, entitiesResult] = await Promise.all([
      languageClient.analyzeSentiment({ document }),
      languageClient.analyzeEntities({ document }),
    ]);

    const sentiment = sentimentResult[0].documentSentiment;
    const entities = entitiesResult[0].entities;

    // Extract relevant skills/keywords from entities
    const keywords = entities
      ?.filter(e => e.type === 'ORGANIZATION' || e.type === 'OTHER' || e.type === 'WORK_OF_ART')
      ?.map(e => e.name)
      .slice(0, 5) // Limit to top 5 keywords
      ?? [];

    const analysis = {
      sentiment: {
        score: sentiment?.score?.toFixed(2) ?? 0, // e.g., 0.8, -0.2
        magnitude: sentiment?.magnitude?.toFixed(2) ?? 0,
      },
      keywords,
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: "Failed to analyze answer." }, { status: 500 });
  }
}