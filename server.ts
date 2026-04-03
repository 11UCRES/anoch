import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1e7, // 10MB for audio blobs
  });

  const PORT = 3000;

  // Matchmaking state
  const waitingQueue: { id: string, username: string }[] = [];
  const activeMatches = new Map<string, { partnerId: string, partnerUsername: string }>(); // socketId -> partner info
  let totalOnline = 0;

  const broadcastStats = () => {
    io.emit("stats_update", {
      online: totalOnline,
      waiting: waitingQueue.length,
      chatting: activeMatches.size
    });
  };

  io.on("connection", (socket) => {
    totalOnline++;
    console.log(`User connected: ${socket.id}`);
    broadcastStats();

    socket.on("join_queue", (data: { username: string }) => {
      // Prevent double joining
      if (waitingQueue.find(u => u.id === socket.id) || activeMatches.has(socket.id)) return;

      const username = data?.username || 'Anonymous';

      if (waitingQueue.length > 0) {
        const partner = waitingQueue.shift()!;
        
        // Match them
        activeMatches.set(socket.id, { partnerId: partner.id, partnerUsername: partner.username });
        activeMatches.set(partner.id, { partnerId: socket.id, partnerUsername: username });

        // Notify both
        io.to(socket.id).emit("matched", { partnerId: partner.id, partnerUsername: partner.username });
        io.to(partner.id).emit("matched", { partnerId: socket.id, partnerUsername: username });
        
        console.log(`Matched ${socket.id} (${username}) with ${partner.id} (${partner.username})`);
      } else {
        waitingQueue.push({ id: socket.id, username });
        socket.emit("waiting");
        console.log(`User ${socket.id} (${username}) added to queue`);
      }
      broadcastStats();
    });

    socket.on("send_message", (data: { id?: string, text: string }) => {
      const match = activeMatches.get(socket.id);
      if (match) {
        // Simple bad word filter
        const badWords = ["badword1", "badword2"]; // Add more as needed
        let filteredText = data.text;
        badWords.forEach(word => {
          const regex = new RegExp(word, "gi");
          filteredText = filteredText.replace(regex, "****");
        });
 
        io.to(match.partnerId).emit("receive_message", {
          id: data.id || uuidv4(),
          text: filteredText,
          senderId: socket.id,
          timestamp: Date.now(),
          type: 'text'
        });
      }
    });

    socket.on("send_voice", (data: { id?: string, audio: string }) => {
      const match = activeMatches.get(socket.id);
      if (match) {
        io.to(match.partnerId).emit("receive_message", {
          id: data.id || uuidv4(),
          audio: data.audio,
          senderId: socket.id,
          timestamp: Date.now(),
          type: 'voice'
        });
      }
    });

    socket.on("edit_message", (data: { messageId: string, newText: string }) => {
      const match = activeMatches.get(socket.id);
      if (match) {
        io.to(match.partnerId).emit("message_edited", {
          messageId: data.messageId,
          newText: data.newText
        });
      }
    });

    socket.on("delete_message", (data: { messageId: string }) => {
      const match = activeMatches.get(socket.id);
      if (match) {
        io.to(match.partnerId).emit("message_deleted", {
          messageId: data.messageId
        });
      }
    });

    socket.on("add_reaction", (data: { messageId: string, emoji: string }) => {
      const match = activeMatches.get(socket.id);
      if (match) {
        io.to(match.partnerId).emit("reaction_added", {
          messageId: data.messageId,
          emoji: data.emoji,
          userId: socket.id
        });
      }
    });

    socket.on("typing", (isTyping: boolean) => {
      const match = activeMatches.get(socket.id);
      if (match) {
        io.to(match.partnerId).emit("partner_typing", isTyping);
      }
    });

    const handleMatchExit = () => {
      const match = activeMatches.get(socket.id);
      
      // Remove from queue if they were there
      const queueIndex = waitingQueue.findIndex(u => u.id === socket.id);
      if (queueIndex !== -1) {
        waitingQueue.splice(queueIndex, 1);
      }

      if (match) {
        io.to(match.partnerId).emit("partner_disconnected");
        activeMatches.delete(match.partnerId);
        activeMatches.delete(socket.id);
      }
      broadcastStats();
    };

    socket.on("next_partner", () => {
      handleMatchExit();
    });

    socket.on("disconnect", () => {
      totalOnline = Math.max(0, totalOnline - 1);
      handleMatchExit();
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
