// server.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import { GoogleGenerativeAI, ChatSession, Content } from "@google/generative-ai";
import { verifyJwt, UserJwtPayload } from "./lib/auth"; 
import * as cookie from "cookie";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface Message {
  sender: "user" | "ai";
  text: string;
}

// ====================================================================
// STATE MANAGEMENT UPGRADE
// We will now store more than just the chat session.
// ====================================================================
interface InterviewSession {
    chat: ChatSession;
    history: Content[]; // We will manually store the history
    participants: Set<string>; // Keep track of who is in the room
}
const interviewSessions = new Map<string, InterviewSession>();


interface AuthenticatedSocket extends Socket {
  user?: UserJwtPayload;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socketio",
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return next(new Error("Authentication error: No token."));
    }

    try {
      const payload = verifyJwt(accessToken);
      if (!payload) { throw new Error("Invalid token."); }
      socket.user = payload; 
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token."));
    }
  });


  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.id}, Name: ${socket.user?.name}`);

    socket.on("joinInterview", (interviewId: string) => {
      let session = interviewSessions.get(interviewId);

      // If no session exists, create a new one
      if (!session) {
        console.log(`[Room: ${interviewId}] Creating new interview session.`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const initialHistory: Content[] = [
           { role: "user", parts: [{ text: "You are FortiTwin, an AI interviewer..." }] },
           { role: "model", parts: [{ text: "Hello, I am FortiTwin..." }] },
        ];

        const chat = model.startChat({ history: initialHistory });
        
        session = {
            chat,
            history: initialHistory,
            participants: new Set(),
        };
        interviewSessions.set(interviewId, session);
      } else {
        console.log(`[Room: ${interviewId}] User rejoining existing session.`);
      }

      socket.join(interviewId);
      session.participants.add(socket.id);

      // Send the entire chat history to the user who just joined
      const chatHistoryForClient = session.history
        .map(h => ({
            sender: h.role === 'user' ? 'user' : 'ai',
            text: h.parts[0].text
        }))
        .slice(2); // Remove the initial system prompts

      socket.emit("chatHistory", chatHistoryForClient);
    });

    socket.on("sendMessage", async (message: Message, interviewId: string) => {
      const session = interviewSessions.get(interviewId);
      if (!session) { return console.error(`No session for ID: ${interviewId}`); }

      // Add user message to history
      session.history.push({ role: 'user', parts: [{ text: message.text }] });

      try {
        const result = await session.chat.sendMessage(message.text);
        const aiText = result.response.text();
        
        // Add AI response to history
        session.history.push({ role: 'model', parts: [{ text: aiText }] });
        
        io.to(interviewId).emit("aiResponse", { sender: "ai", text: aiText });
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        io.to(interviewId).emit("aiResponse", {
          sender: "ai",
          text: "My apologies, I am experiencing a technical issue.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      // Find which interview the user was in and remove them
      for (const [interviewId, session] of interviewSessions.entries()) {
          if (session.participants.has(socket.id)) {
              session.participants.delete(socket.id);
              console.log(`[Room: ${interviewId}] User ${socket.id} left. Participants remaining: ${session.participants.size}`);
              
              // Optional: If no one is left, you can set a timer to clean up the session
              if (session.participants.size === 0) {
                  setTimeout(() => {
                      const currentSession = interviewSessions.get(interviewId);
                      if (currentSession && currentSession.participants.size === 0) {
                          console.log(`[Room: ${interviewId}] Cleaning up inactive session.`);
                          interviewSessions.delete(interviewId);
                      }
                  }, 300000); // 5 minutes
              }
              break;
          }
      }
    });
  });

  httpServer
    .listen(port, () => {
      console.log(`> Server ready on http://${hostname}:${port}`);
    });
});