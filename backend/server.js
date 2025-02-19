
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.post("/debug", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid code input" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze and debug the following ${language} code:\n${code}\nProvide fixes and explanations.`;
    
    const response = await model.generateContent([prompt]);
    const debugOutput = response.response.candidates[0]?.content?.parts[0]?.text || "No response from Gemini";

    res.json({ debugOutput });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Error processing request", details: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("codeUpdate", (data) => {
    if (typeof data.code === "string") {
      socket.broadcast.emit("codeUpdate", data);
    }
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));

