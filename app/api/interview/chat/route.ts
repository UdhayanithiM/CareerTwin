// app/api/interview/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // --- AI Integration Point ---
    // This is where you would call your AI service (e.g., Botpress, OpenAI GPT, etc.)
    // You would pass the `messages` array to the AI to get a contextual response.
    // For this example, we'll just send back a dynamic, rule-based response.

    const lastUserMessage = messages[messages.length - 1]?.text.toLowerCase() || '';
    let aiResponse = "That's a good point. Could you tell me about a time you faced a significant challenge at work?";

    if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) {
      aiResponse = "Hello! Thanks for starting the interview. To begin, please tell me a little about yourself.";
    } else if (lastUserMessage.includes('challenge')) {
      aiResponse = "Interesting. What was the outcome of that situation, and what did you learn from it?";
    } else if (lastUserMessage.includes('thank you') || lastUserMessage.includes('thanks')) {
        aiResponse = "You're welcome. Let's move to the next question. What are your biggest strengths?";
    }

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}