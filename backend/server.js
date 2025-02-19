// // /* Full Project: AI-Based Debugging Tool */

// // // Backend: Express.js + OpenAI API for debugging
// // const express = require("express");
// // const cors = require("cors");
// // const { OpenAI } = require("openai");
// // const http = require("http");
// // const { Server } = require("socket.io");
// // require("dotenv").config();

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, { cors: { origin: "*" } });
// // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // app.use(cors());
// // app.use(express.json());

// // // AI Debugging API
// // app.post("/debug", async (req, res) => {
// //   const { code } = req.body;
// //   try {
// //     const response = await openai.completions.create({
// //       model: "gpt-4",
// //       prompt: `Analyze and debug the following code:
// //       ${code}
// //       Provide fixes and explanations.`,
// //       max_tokens: 200,
// //     });
// //     res.json({ debugOutput: response.choices[0].text });
// //   } catch (error) {
// //     res.status(500).json({ error: "Error processing request" });
// //   }
// // });

// // // Real-time collaboration
// // io.on("connection", (socket) => {
// //   console.log("A user connected");
// //   socket.on("codeUpdate", (code) => {
// //     socket.broadcast.emit("codeUpdate", code);
// //   });
// //   socket.on("disconnect", () => console.log("User disconnected"));
// // });

// // server.listen(5000, () => console.log("Server running on port 5000"));

// // // Frontend: React.js with CodeMirror for code editing
// // import React, { useState, useEffect } from "react";
// // import { io } from "socket.io-client";
// // import CodeMirror from "@uiw/react-codemirror";
// // import { javascript } from "@codemirror/lang-javascript";
// // import axios from "axios";

// // const socket = io("http://localhost:5000");

// // export default function Debugger() {
// //   const [code, setCode] = useState("console.log(\"Hello, world!\");");
// //   const [debugOutput, setDebugOutput] = useState("");

// //   useEffect(() => {
// //     socket.on("codeUpdate", (newCode) => setCode(newCode));
// //     return () => socket.off("codeUpdate");
// //   }, []);

// //   const handleCodeChange = (newCode) => {
// //     setCode(newCode);
// //     socket.emit("codeUpdate", newCode);
// //   };

// //   const handleDebug = async () => {
// //     const response = await axios.post("http://localhost:5000/debug", { code });
// //     setDebugOutput(response.data.debugOutput);
// //   };

// //   return (
// //     <div>
// //       <h1>AI Debugger</h1>
// //       <CodeMirror value={code} extensions={[javascript()]} onChange={handleCodeChange} />
// //       <button onClick={handleDebug}>Debug</button>
// //       <pre>{debugOutput}</pre>
// //     </div>
// //   );
// // }


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



// import express from "express";
// import cors from "cors";
// import http from "http";
// import { Server } from "socket.io";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.use(cors());
// app.use(express.json());

// app.post("/debug", async (req, res) => {
//   const { code } = req.body;

//   if (!code || typeof code !== "string") {
//     return res.status(400).json({ error: "Invalid code input" });
//   }

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const response = await model.generateContent([
//       "Analyze and debug the following code:",
//       code,
//     ]);

//     const debugOutput = response.response.candidates[0]?.content?.parts[0]?.text || "No response from Gemini";

//     res.json({ debugOutput });
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     res.status(500).json({ error: "Error processing request", details: error.message });
//   }
// });

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("codeUpdate", (code) => {
//     if (typeof code === "string") {
//       socket.broadcast.emit("codeUpdate", code);
//     }
//   });

//   socket.on("disconnect", () => console.log("User disconnected"));
// });

// server.listen(5000, () => console.log("Server running on port 5000"));
