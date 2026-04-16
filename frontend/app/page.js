"use client";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !token) return alert("File and token required");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    alert(data.message);
  };

  const handleQuery = async () => {
    if (!query || !token) return;

    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "ai", text: data.answer || "No response" },
    ]);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">DocuMind AI</h1>

      {/* TOKEN */}
      <div className="w-full max-w-3xl mb-4">
        <input
          placeholder="Paste your JWT token..."
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      {/* UPLOAD SECTION */}
      <div className="w-full max-w-3xl bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg mb-3">Upload Document</h2>
        <div className="flex gap-3 items-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* CHAT */}
      <div className="w-full max-w-3xl bg-gray-800 p-4 rounded flex flex-col h-[400px] overflow-y-auto mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-10">
            Ask something about your document...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 p-3 rounded max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-600 self-end"
                : "bg-gray-700 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 text-sm">Thinking...</div>
        )}
      </div>

      {/* INPUT */}
      <div className="w-full max-w-3xl flex">
        <input
          className="flex-1 p-3 rounded-l bg-gray-800 border border-gray-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
        />
        <button
          onClick={handleQuery}
          className="bg-green-600 px-6 rounded-r hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}