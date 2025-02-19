import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import axios from "axios";
import "./style.css";

const socket = io("http://localhost:5000");

export default function Debugger() {
  const [code, setCode] = useState(`console.log("Hello, world!");`);
  const [language, setLanguage] = useState("JavaScript");
  const [debugOutput, setDebugOutput] = useState("");

  useEffect(() => {
    socket.on("codeUpdate", (data) => {
      setCode(data.code);
      setLanguage(data.language);
    });

    return () => socket.off("codeUpdate");
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeUpdate", { code: newCode, language });
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleDebug = async () => {
    const response = await axios.post("http://localhost:5000/debug", { code, language });
    setDebugOutput(response.data.debugOutput);
  };

  return (
    <div className="container">
      <h1>AI Debugger</h1>
      <select className="language-select" value={language} onChange={handleLanguageChange}>
        <option value="JavaScript">JavaScript</option>
        <option value="Python">Python</option>
        <option value="Java">Java</option>
      </select>
      <div className="editor">
        <CodeMirror value={code} extensions={[javascript()]} onChange={handleCodeChange} />
      </div>
      <button onClick={handleDebug}>Debug</button>
      <pre className="debug-output">{debugOutput}</pre>
    </div>
  );
}


