// app/api/analyze-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import pdf from "pdf-parse";
// This now correctly imports the new getter functions
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"; 
import { saveAnalysisResult } from "@/lib/firestore";

const opportunityAnalysisSchema = z.object({
    strengths: z.array(z.string()).min(3).max(5),
    gaps: z.array(z.string()).min(3).max(5),
    atsScore: z.number().int().min(0).max(100),
    suggestions: z.array(z.string()).length(2)
});

export async function POST(req: NextRequest) {
    try {
        // --- 1. Authenticate User ---
        // This now calls the function to get the instance
        const adminAuth = getAdminAuth(); 
        const authToken = req.headers.get('Authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized: Auth token missing." }, { status: 401 });
        }
        
        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const uid = decodedToken.uid;

        // --- 2. Process and Validate Incoming Data ---
        const formData = await req.formData();
        const resumeFile = formData.get('resumeFile') as File | null;
        const jobDescriptionText = formData.get('jobDescriptionText') as string | null;

        if (!resumeFile || !jobDescriptionText) {
            return NextResponse.json({ error: "Bad Request: Resume file and Job Description are required." }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
        const pdfData = await pdf(fileBuffer);
        const resumeText = pdfData.text;
        
        if (!resumeText) {
            return NextResponse.json({ error: "Bad Request: Could not extract text from the provided PDF." }, { status: 400 });
        }
        
        // --- 3. Interact with Generative AI Model ---
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Internal Server Error: GEMINI_API_KEY is not configured.");
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro-latest",
            generationConfig: { responseMimeType: "application/json" },
        });
        
        const prompt = `
            Analyze the following resume against the job description. Your response MUST be a valid JSON object that strictly adheres to the following structure:
            {
              "strengths": ["An array of 3 to 5 string showcasing the candidate's key strengths for this role."],
              "gaps": ["An array of 3 to 5 strings identifying where the resume is weak for this specific job."],
              "atsScore": 85, 
              "suggestions": ["An array of exactly 2 actionable string suggestions to improve the resume."]
            }
            Job Description: --- ${jobDescriptionText} ---
            Resume Text: --- ${resumeText} ---
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // --- 4. Validate AI Output and Persist Data ---
        const parsedObject = JSON.parse(responseText);
        const validation = opportunityAnalysisSchema.safeParse(parsedObject);

        if (!validation.success) {
            console.error("Zod Validation Error:", validation.error.flatten());
            throw new Error("Internal Server Error: AI model returned an object with an invalid shape.");
        }
        
        const analysisData = validation.data;

        await saveAnalysisResult(uid, {
            jobDescription: jobDescriptionText.substring(0, 150) + "...",
            fileName: resumeFile.name,
            ...analysisData
        });

        // --- 5. Return Successful Response ---
        return NextResponse.json(analysisData);

    } catch (error: any) {
        console.error("Analysis API Error:", error.message);
        
        if (error.code?.startsWith('auth/')) {
            return NextResponse.json({ error: "Authentication session has expired. Please log in again." }, { status: 401 });
        }
        
        const errorMessage = error.message.includes("Internal Server Error") 
            ? error.message 
            : "An unexpected error occurred.";
            
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}