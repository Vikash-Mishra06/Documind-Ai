"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // 🔐 Protect route
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      router.push("/login");
    } else {
      setToken(savedToken);
      fetchDocuments();
    }
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 📤 Upload file
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

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

    await fetchDocuments();
  };

  // 💬 Ask question
  const handleQuery = async () => {
    if (!query) return;

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

  const fetchDocuments = async () => {
    const res = await fetch("http://localhost:5000/api/documents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setDocuments(data.documents || []);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">DocuMind AI Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* UPLOAD SECTION */}
      <div className="w-full max-w-4xl bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg mb-3">Upload Document</h2>
        <div className="flex gap-3 items-center">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={handleUpload}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="w-full max-w-4xl bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg mb-3">Your Documents</h2>

        {documents.length === 0 ? (
          <p className="text-gray-400">No documents uploaded yet</p>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {documents.map((doc, i) => (
              <li key={i} className="bg-gray-700 p-2 rounded text-sm">
                📄 {doc.fileName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CHAT SECTION */}
      <div className="w-full max-w-4xl bg-gray-800 p-4 rounded flex flex-col h-[400px] overflow-y-auto mb-4">
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

        {loading && <div className="text-gray-400 text-sm">Thinking...</div>}
      </div>

      {/* INPUT */}
      <div className="w-full max-w-4xl flex">
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
