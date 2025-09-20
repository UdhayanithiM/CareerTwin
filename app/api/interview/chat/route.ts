// File: app/api/interview/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// IMPORTANT: Set runtime to edge for best streaming performance
export const runtime = 'edge';

const buildGoogleGenAIPrompt = (messages: Message[]) => ({
  contents: messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
});

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();
    const { interviewContext } = data;

    const systemPrompt = `You are an expert "AI Interview Coach" for a company called CareerTwin.
    Your name is Kai. You are conducting a realistic mock interview.
    Your persona is encouraging, professional, and insightful.
    The user is a student preparing for a job.
    Interview Context: You are interviewing the user for a "${interviewContext || "Software Engineer"}" role.

    Your instructions are:
    1.  Ask one question at a time.
    2.  Wait for the user's response before asking the next question.
    3.  After 5-6 questions, conclude the interview and provide a detailed, actionable feedback report in markdown format.
    4.  The feedback report MUST include: a performance summary, 2-3 strengths, 2-3 areas for improvement, and an example of how to improve one of their answers using the STAR method.

    Start the interview by introducing yourself as Kai, stating the role you're interviewing for, and then ask the first question.`;

    const geminiStream = await genAI
      .getGenerativeModel({ model: 'gemini-1.5-pro-latest', systemInstruction: systemPrompt })
      .generateContentStream(buildGoogleGenAIPrompt(messages));

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiStream);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in AI Interview Coach API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}