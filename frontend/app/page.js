"use client";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = async () => {
    if (!query) return;

    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);

    setQuery("");

    const res = await fetch("http://localhost:5000/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "ai", text: data.answer || "No response" },
    ]);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold mb-5">DocuMind AI</h1>

      <div className="w-full max-w-2xl space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded ${
              msg.role === "user" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="mt-5 flex w-full max-w-2xl">
        <input
          className="flex-1 p-3 text-black rounded-l"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..."
        />
        <button
          onClick={handleSubmit}
          className="bg-green-600 px-5 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}