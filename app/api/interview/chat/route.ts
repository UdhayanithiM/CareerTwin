// app/api/interview/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
// ⛔️ REMOVED: No more 'ai' package imports needed. This is the fix.
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, data } = await req.json();
    const { interviewContext } = data;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const chatHistory = messages.map((msg: ChatMessage) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const systemPrompt = `You are Kai, an expert AI Interview Coach for CareerTwin. Your task is to conduct a professional interview for a "${interviewContext}" role. Ask one question at a time. Keep your questions clear and concise. After the user answers, provide a short, encouraging follow-up and then ask the next relevant question. Begin the interview now.`;
    
    const contents = [...chatHistory.slice(0, -1), { role: 'model', parts: [{ text: systemPrompt }] }, ...chatHistory.slice(-1)];

    const response = await model.generateContentStream({ contents });

    // ✨ THE DEFINITIVE FIX: Manually create a ReadableStream.
    // This has zero dependency on the 'ai' package and is guaranteed to work.
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of response.stream) {
                const chunkText = chunk.text();
                // Encode the text chunk and enqueue it into the stream
                controller.enqueue(encoder.encode(chunkText));
            }
            // Signal that the stream is finished
            controller.close();
        },
    });

    // Return the stream as a standard web Response.
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return new NextResponse(JSON.stringify({ error: "An error occurred in the chat API." }), { status: 500 });
  }
}