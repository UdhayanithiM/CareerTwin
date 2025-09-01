// server.ts

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
// Step 1: Import the necessary classes from the Google AI library
import { GoogleGenerativeAI, ChatSession, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Step 2: Initialize the Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Define the structure for chat messages
interface Message {
  sender: "user" | "ai";
  text: string;
}

// Use a Map to store a unique chat session for each connected user
const chatSessions = new Map<string, ChatSession>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  io.on("connection", (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Step 3: Create a new chat session when a user connects
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      // Safety settings to ensure professional responses
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const chat = model.startChat({
      // This history provides the initial context and persona for the AI
      history: [
        {
          role: "user",
          parts: [{ text: "You are FortiTwin, an AI interviewer. Your goal is to conduct a professional interview. Start by introducing yourself and asking the candidate to tell you about themselves." }],
        },
        {
          role: "model",
          parts: [{ text: "Hello, I am FortiTwin, your AI interviewer for this session. It's a pleasure to meet you. To begin, could you please tell me a bit about yourself and your professional background?" }],
        },
      ],
    });

    // Store the session, linking it to the user's unique socket ID
    chatSessions.set(socket.id, chat);

    // Send the AI's initial greeting to the client
    socket.emit("aiResponse", {
        sender: "ai",
        text: "Hello, I am FortiTwin, your AI interviewer for this session. It's a pleasure to meet you. To begin, could you please tell me a bit about yourself and your professional background?"
    });


    socket.on("sendMessage", async (message: Message) => {
      console.log(`Received message from ${socket.id}, sending to Gemini: "${message.text}"`);
      const userChat = chatSessions.get(socket.id);

      if (!userChat) {
        console.error(`No chat session found for user ${socket.id}`);
        return;
      }

      try {
        // Step 4: Send the user's message to Gemini and get the response
        const result = await userChat.sendMessage(message.text);
        const response = result.response;
        const aiText = response.text();

        // Step 5: Send the AI's generated response back to the client
        socket.emit("aiResponse", { sender: "ai", text: aiText });
        console.log(`Sent AI response to ${socket.id}: "${aiText}"`);
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        socket.emit("aiResponse", {
          sender: "ai",
          text: "My apologies, I seem to be experiencing a technical issue right now. Please give me a moment to reconnect.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("👋 Client disconnected:", socket.id);
      // Step 6: Clean up the session from memory when the user disconnects
      chatSessions.delete(socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Server ready on http://${hostname}:${port}`);
    });
});