import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import { verifyJwt, UserJwtPayload } from "./lib/auth";
import * as cookie from "cookie";
import { prisma } from "./lib/prisma";
import axios from "axios";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface InterviewSession {
  history: ChatMessage[];
  candidateId?: string;
}

interface AuthenticatedSocket extends Socket {
  user?: UserJwtPayload;
}

const interviewSessions = new Map<string, InterviewSession>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*", credentials: true },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      if (!token) return next(new Error("Authentication error"));
      const payload = await verifyJwt(token);
      if (!payload) return next(new Error("Invalid token"));
      socket.user = payload;
      next();
    } catch {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("joinInterview", (interviewId: string) => {
      let session = interviewSessions.get(interviewId);
      if (!session) {
        const initialHistory: ChatMessage[] = [{ role: "model", content: "Hello! I'm FortiTwin. To begin, please tell me about yourself." }];
        session = { history: initialHistory, candidateId: socket.user?.id };
        interviewSessions.set(interviewId, session);
      }
      socket.join(interviewId);
      const chatHistoryForClient = session.history.map(h => ({ sender: h.role === 'user' ? 'user' : 'ai', text: h.content }));
      socket.emit("chatHistory", chatHistoryForClient);
    });
    
    socket.on("sendMessage", async (message, interviewId) => {
        const session = interviewSessions.get(interviewId);
        if (!session) return;

        session.history.push({ role: "user", content: message.text });

        const mlServiceUrl = "http://127.0.0.1:8008/api/v1/chat";
        const requestBody = {
            messages: session.history.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.content
            }))
        };
        
        try {
            console.log("Calling ML service...");
            const response = await axios.post(mlServiceUrl, requestBody, { timeout: 60000 });
            const aiText = response.data.content;

            if (aiText) {
                session.history.push({ role: "model", content: aiText });
                // Send response directly to the specific user
                socket.emit("aiResponse", { sender: "ai", text: aiText });
            } else {
                throw new Error("Received empty response from AI.");
            }
        } catch (err: any) {
            console.error("Error calling ML service:", err.message);
            socket.emit("aiResponse", { sender: "ai", text: "Sorry, the AI service has a problem. Please try again." });
        }
    });

    // Your endInterview and disconnect logic here...
    socket.on("disconnect", () => {
        console.log(`👋 Disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});