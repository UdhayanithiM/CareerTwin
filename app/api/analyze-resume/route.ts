// app/api/analyze-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import pdf from "pdf-parse";

// Define a Zod schema for validating the AI model's output.
const opportunityAnalysisSchema = z.object({
    strengths: z.array(z.string()).min(3).max(5),
    gaps: z.array(z.string()).min(3).max(5),
    atsScore: z.number().int().min(0).max(100),
    suggestions: z.array(z.string()).length(2)
});

export async function POST(req: NextRequest) {
    console.log("\n---");
    console.log("🚀 POST /api/analyze-resume route handler invoked.");

    try {
        // 1. Initialize AI Model
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined");
        }
        console.log("✅ GEMINI_API_KEY found.");
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro-latest",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });
        console.log("✅ Google AI Model initialized in JSON Mode.");

        // 2. Process Incoming Form Data
        const formData = await req.formData();
        console.log("✅ Form data received.");

        const resumeFile = formData.get('resumeFile') as File | null;
        const jobDescriptionText = formData.get('jobDescriptionText') as string | null;

        if (!resumeFile || !jobDescriptionText) {
            return NextResponse.json({ error: "Resume file and Job Description are required" }, { status: 400 });
        }
        console.log(`✅ Resume file: ${resumeFile.name}, Job Description length: ${jobDescriptionText.length}`);

        // 3. Parse the PDF file
        const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
        const pdfData = await pdf(fileBuffer);
        const resumeText = pdfData.text;
        
        if (!resumeText) {
            return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 });
        }
        console.log(`✅ PDF parsed. Resume text length: ${resumeText.length}`);

        // 4. Generate Prompt and Call AI Model
        // ✨ **FIX:** Use a prompt that explicitly defines the desired JSON structure.
        const prompt = `
            Analyze the following resume against the job description. Your response MUST be a JSON object that strictly adheres to the following structure:
        
            {
              "strengths": ["An array of 3 to 5 string showcasing the candidate's key strengths for this role."],
              "gaps": ["An array of 3 to 5 strings identifying where the resume is weak for this specific job."],
              "atsScore": "An integer between 0 and 100 representing the resume's match to the job description.",
              "suggestions": ["An array of exactly 2 actionable string suggestions to improve the resume."]
            }
        
            Job Description:
            ---
            ${jobDescriptionText}
            ---
        
            Resume Text:
            ---
            ${resumeText}
            ---
        `;
        console.log("✅ Prompt created. Calling Google AI...");

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("✅ Received response from Google AI.");

        // 5. Validate and Return Response
        const parsedObject = JSON.parse(responseText);
        const validation = opportunityAnalysisSchema.safeParse(parsedObject);

        if (!validation.success) {
            // Log the actual object received from the AI for easier debugging
            console.error("❌ Zod validation failed. AI Response:", parsedObject);
            console.error("Validation Errors:", validation.error);
            throw new Error("AI model returned an object with an invalid shape.");
        }
        console.log("✅ AI response validated. Sending success response.");

        return NextResponse.json(validation.data);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        console.error("❌ CATCH BLOCK: An error occurred in the handler.", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}