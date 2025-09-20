// File: app/api/analyze-resume/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText) {
      return new NextResponse("Resume text is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `You are "The Analyst," an expert career advisor for the CareerTwin platform.
    Analyze the following resume text meticulously.
    Your task is to identify the user's top 3 most marketable skills and recommend 3 specific, suitable career paths.
    For each career path, provide a concise, one-sentence justification explaining why it's a good fit based on the resume.
    You MUST return the response as a valid JSON object. Do not include any markdown formatting like \`\`\`json.
    The JSON object should have this exact structure: { "skills": ["Skill 1", "Skill 2", "Skill 3"], "careerPaths": [{ "title": "Career Path Title", "justification": "Justification sentence." }] }

    Resume Text: "${resumeText}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean and parse the JSON response
    const responseJson = JSON.parse(responseText);

    return NextResponse.json(responseJson);

  } catch (error) {
    console.error("Error in Analyst API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}