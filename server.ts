// in server.ts

import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import { GoogleGenerativeAI, ChatSession, Content, Part } from "@google/generative-ai";
import { verifyJwt, UserJwtPayload } from "./lib/auth";
import * as cookie from "cookie";
import { prisma } from "./lib/prisma";
import { Prisma } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface InterviewSession {
  chat: ChatSession;
  history: Content[];
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const initialHistory: Content[] = [
            { role: "user", parts: [{ text: "You are FortiTwin, an expert AI interviewer..." }]},
            { role: "model", parts: [{ text: "Hello! I'm FortiTwin..." }]},
        ];
        const chat = model.startChat({ history: initialHistory });
        session = { chat, history: initialHistory, participants: new Set(), candidateId: socket.user?.id };
        interviewSessions.set(interviewId, session);
      }
      socket.join(interviewId);
      session!.participants.add(socket.id);
      const chatHistoryForClient = session!.history.map((h) => ({
        sender: h.role === "user" ? "user" : "ai",
        text: (h.parts[0] as Part).text!,
      })).slice(2);
      socket.emit("chatHistory", chatHistoryForClient);
    });

    socket.on("sendMessage", async (message, interviewId) => {
      const session = interviewSessions.get(interviewId);
      if (!session) return;
      session.history.push({ role: "user", parts: [{ text: message.text }] });
      try {
        const result = await session.chat.sendMessage(message.text);
        const aiText = result.response.text();
        session.history.push({ role: "model", parts: [{ text: aiText }] });
        io.to(interviewId).emit("aiResponse", { sender: "ai", text: aiText });
      } catch (err) { console.error("Gemini API error:", err); }
    });

    socket.on("endInterview", async (interviewId: string, callback) => {
        const session = interviewSessions.get(interviewId);
        if (!session || !session.candidateId) {
            return callback({ error: "Session not found or invalid." });
        }
        console.log(`[Room: ${interviewId}] Ending interview and starting analysis...`);
        try {
            const transcript = session.history.slice(2).map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${(h.parts[0] as Part).text}`).join('\n');
            
            const analysisPrompt = `
                Analyze the following interview transcript. Act as an expert HR analyst.
                Return ONLY a single, minified JSON object with NO markdown formatting (no \`\`\`json).
                The JSON object must have these exact keys: 'summary' (a 3-sentence overview),
                'strengths' (an array of 3 strings), 'areasForImprovement' (an array of 3 strings),
                and 'behavioralScores' (a JSON object with keys 'communication', 'problemSolving', and 'leadership', each with a score from 0-100).

                Transcript:
                ---
                ${transcript}
                ---
            `;
            
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const result = await model.generateContent(analysisPrompt);
            let rawResponse = result.response.text();

            const jsonMatch = rawResponse.match(/\{.*\}/s);
            if (!jsonMatch) {
                throw new Error("AI did not return a valid JSON object.");
            }
            const reportData = JSON.parse(jsonMatch[0]);

            const technicalAssessment = await prisma.technicalAssessment.findFirst({
                where: { assessmentId: interviewId },
            });

            // --- THIS IS THE FIX ---
            // We now use `upsert` instead of `create`.
            // It will UPDATE the report if one exists for this assessmentId,
            // or CREATE a new one if it doesn't.
            const newReport = await prisma.report.upsert({
                where: { assessmentId: interviewId }, // How to find the record
                update: { // What to update if it exists
                    summary: reportData.summary,
                    strengths: reportData.strengths,
                    areasForImprovement: reportData.areasForImprovement,
                    behavioralScores: reportData.behavioralScores,
                    technicalScore: technicalAssessment?.score ?? 0,
                },
                create: { // What to create if it doesn't exist
                    assessmentId: interviewId,
                    candidateId: session.candidateId,
                    summary: reportData.summary,
                    strengths: reportData.strengths,
                    areasForImprovement: reportData.areasForImprovement,
                    behavioralScores: reportData.behavioralScores,
                    technicalScore: technicalAssessment?.score ?? 0,
                },
            });
            // --- END OF FIX ---

            console.log(`[Room: ${interviewId}] Report ${newReport.id} created/updated successfully.`);
            
            await prisma.behavioralInterview.update({
                where: { assessmentId: interviewId },
                data: {
                    status: 'COMPLETED',
                    transcript: session.history as unknown as Prisma.JsonValue,
                    completedAt: new Date()
                }
            });

            interviewSessions.delete(interviewId);
            callback({ reportId: newReport.id });

        } catch (error) {
            console.error(`[Room: ${interviewId}] Analysis failed:`, error);
            callback({ error: "Failed to generate and save the report." });
        }
    });

    socket.on("disconnect", () => {
      console.log(`👋 Disconnected: ${socket.id}`);
      // ... existing disconnect logic
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});