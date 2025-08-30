// server.ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // This is where we will handle real-time events
    socket.on("sendMessage", (message) => {
      // For now, we just log it. Later, this will go to the AI.
      console.log("Received message:", message);
      
      // Echo the message back with a delay to simulate AI thinking
      setTimeout(() => {
        socket.emit("aiResponse", {
          sender: "ai",
          text: `You said: "${message.text}". That's a great point. What are your thoughts on teamwork?`,
        });
      }, 1200);
    });

    socket.on("disconnect", () => {
      console.log("👋 Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});