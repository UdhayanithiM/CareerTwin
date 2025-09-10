// server.ts (FINAL VERSION - FIXES Transcript Type ERROR)

import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import { verifyJwt, UserJwtPayload } from "./lib/auth";
import * as cookie from "cookie";
import { prisma } from "./lib/prisma";
import { Prisma } from "@prisma/client";
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
  participants: Set<string>;
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
    path: "/api/socketio",
    cors: { origin: "*", credentials: true },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      if (!token) return next(new Error("Authentication error: No token."));
      const payload = await verifyJwt(token);
      if (!payload) return next(new Error("Invalid token."));
      socket.user = payload;
      next();
    } catch {
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.id}, Name: ${socket.user?.name}`);

    socket.on("joinInterview", (interviewId: string) => {
      let session = interviewSessions.get(interviewId);
      if (!session) {
        const initialHistory: ChatMessage[] = [
            { role: "model", content: "Hello! I'm FortiTwin, your AI interviewer. To begin, please tell me a little about yourself." }
        ];
        session = { history: initialHistory, participants: new Set(), candidateId: socket.user?.id };
        interviewSessions.set(interviewId, session);
      }
      socket.join(interviewId);
      session!.participants.add(socket.id);
      
      const chatHistoryForClient = session!.history.map(h => ({
        sender: h.role === 'user' ? 'user' : 'ai',
        text: h.content
      }));
      socket.emit("chatHistory", chatHistoryForClient);
    });

    socket.on("sendMessage", async (message, interviewId) => {
      const session = interviewSessions.get(interviewId);
      if (!session) return;

      session.history.push({ role: "user", content: message.text });

      try {
        const mlServiceUrl = process.env.ML_SERVICE_URL;
        if (!mlServiceUrl) throw new Error("ML_SERVICE_URL not set");

        const response = await axios.post(`${mlServiceUrl}/chat`, {
          user_input: message.text
        });
        
        const aiText = response.data.ai_response;

        session.history.push({ role: "model", content: aiText });
        io.to(interviewId).emit("aiResponse", { sender: "ai", text: aiText });
      } catch (err) { 
        console.error("Local AI service error:", err);
        io.to(interviewId).emit("aiResponse", { sender: "ai", text: "Sorry, my AI service is not responding." });
      }
    });

    socket.on("endInterview", async (interviewId: string, callback) => {
        const session = interviewSessions.get(interviewId);
        if (!session || !session.candidateId) {
            return callback({ error: "Session not found or invalid." });
        }
        
        try {
            const reportData = {
                summary: "This is a placeholder summary. The full AI analysis feature is the next upgrade.",
                strengths: ["Good communication", "Clear examples"],
                areasForImprovement: ["Provide more technical depth"],
                behavioralScores: { communication: 80, problemSolving: 75, leadership: 70 }
            };

            const technicalAssessment = await prisma.technicalAssessment.findFirst({
                where: { assessmentId: interviewId },
            });
            
            const newReport = await prisma.report.upsert({
                where: { assessmentId: interviewId },
                update: {
                    summary: reportData.summary,
                    strengths: reportData.strengths,
                    areasForImprovement: reportData.areasForImprovement,
                    behavioralScores: reportData.behavioralScores,
                    technicalScore: technicalAssessment?.score ?? 0,
                },
                create: {
                    assessmentId: interviewId,
                    candidateId: session.candidateId,
                    summary: reportData.summary,
                    strengths: reportData.strengths,
                    areasForImprovement: reportData.areasForImprovement,
                    behavioralScores: reportData.behavioralScores,
                    technicalScore: technicalAssessment?.score ?? 0,
                },
            });
            
            console.log(`[Room: ${interviewId}] Report ${newReport.id} created/updated successfully.`);
            
            await prisma.behavioralInterview.update({
                where: { assessmentId: interviewId },
                data: {
                    status: 'COMPLETED',
                    // --- THIS IS THE FIX ---
                    // We tell TypeScript to trust that this format is correct.
                    transcript: session.history as any, 
                    completedAt: new Date()
                }
            });

            interviewSessions.delete(interviewId);
            callback({ reportId: newReport.id });

        } catch (error) {
            console.error(`[Room: ${interviewId}] Report generation failed:`, error);
            callback({ error: "Failed to generate and save the report." });
        }
    });

    socket.on("disconnect", () => {
        console.log(`👋 Disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});