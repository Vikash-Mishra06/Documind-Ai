"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  LayoutDashboard, FileText, MessageSquare, Menu, X,
  LogOut, Upload, Send, Bot, User, 
  Loader2, Plus, Sparkles, Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://documind-ai-klfw.onrender.com";

export default function Dashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/login");
    } else {
      setToken(savedToken);
      fetchDocuments(savedToken);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchDocuments = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    setLoading(true);
    toast.loading("Processing document...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      fetchDocuments(token);

      toast.success(`Document "${selectedFile.name}" uploaded! (${data.totalChunks || 0} chunks processed). Ask me anything about it.`, {
        description: "Ready to query your new document.",
      });

      // Auto-add welcome message to chat
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: `"${selectedFile.name}" Successfully uploaded and processed into ${data.totalChunks || 0} chunks. What would you like to know about it?` 
      }]);

    } catch (err) { 
      toast.error("Upload failed: " + err.message);
    } finally { 
      setLoading(false);
      toast.dismiss();
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!data.answer || data.answer.includes("not enough information")) {
        setMessages([...newMessages, { 
          role: "ai", 
          text: data.answer || "No relevant information found. Try rephrasing or upload more documents." 
        }]);
      } else {
        setMessages([...newMessages, { role: "ai", text: data.answer }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "ai", text: "Server error. Try again later." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-[100svh] min-h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 lg:hidden bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* --- Mobile Sidebar --- */}
      <motion.aside 
        initial={false}
        animate={{ x: isMobileSidebarOpen ? 0 : "-100%" }}
        className="fixed top-0 left-0 z-40 w-72 sm:w-80 h-[100svh] border-r border-zinc-800 flex flex-col bg-[#09090b] shadow-2xl lg:hidden"
        transition={{ type: "spring", damping: 30 }}
      >
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Sparkles className="size-5 sm:size-[20px] text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight truncate">DocuMind</span>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all flex-shrink-0 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 sm:px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard className="size-4 sm:size-4.5 flex-shrink-0" />} label="Overview" active />
          <div className="pt-4 pb-2 px-3 sm:px-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Documents</div>
          <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar px-1 sm:px-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 p-2 text-xs sm:text-sm text-zinc-400 hover:bg-zinc-800/50 rounded-lg group cursor-pointer">
                <FileText className="size-3.5 sm:size-3.5 flex-shrink-0" />
                <span className="truncate">{doc.fileName}</span>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-3 sm:p-4 border-t border-zinc-800">
          <button 
            onClick={() => {
              handleLogout();
              setIsMobileSidebarOpen(false);
            }} 
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-xs sm:text-sm"
          >
            <LogOut className="size-4 sm:size-4.5 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-800 flex flex-col bg-[#09090b] z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">DocuMind</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active />
          <div className="pt-4 pb-2 px-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Documents</div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar px-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 p-2 text-sm text-zinc-400 hover:bg-zinc-800/50 rounded-lg group cursor-pointer">
                <FileText size={14} className="shrink-0" />
                <span className="truncate">{doc.fileName}</span>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#09090b] to-[#09090b]">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-zinc-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#09090b]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all flex-shrink-0"
            >
              <Menu className="size-5 sm:size-6" />
            </button>
            <h2 className="hidden sm:block text-sm font-medium text-zinc-400 truncate max-w-[200px] sm:max-w-[300px]">
              Knowledge Base / <span className="text-zinc-100">AI Assistant</span>
            </h2>
            <span className="sm:hidden text-xs font-semibold text-zinc-300">AI Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-1.5 bg-zinc-100 text-black px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-300 transition-colors">
              <Plus className="size-3.5 sm:size-3.5 flex-shrink-0" />
              {loading ? "Proc..." : "New Doc"}
              <input type="file" className="hidden" onChange={handleUpload} disabled={loading} accept=".pdf" />
            </label>
          </div>
        </header>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
{messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center border-2 border-indigo-500/30 shadow-2xl">
                <FileText className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Get Started with DocuMind
                </h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                  Upload your first PDF document and unlock AI-powered insights using RAG technology.
                </p>
              </div>
              <label className="group relative cursor-pointer">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-200 flex items-center gap-3 mx-auto">
                  <Upload size={24} />
                  <span>Upload PDF Document</span>
                  <div className="ml-2 w-5 h-5 bg-white/20 rounded-full group-hover:bg-white/30 animate-pulse"></div>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleUpload} 
                  disabled={loading} 
                />
              </label>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Secure • Private • Processed locally
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"><Bot size={16} /></div>}
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === "user" && <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0"><User size={16} /></div>}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-4 items-center animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><Loader2 size={16} className="animate-spin" /></div>
                  <div className="text-xs text-zinc-500 font-medium">DocuMind is thinking...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-t border-zinc-800 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-[#09090b]/80">
          <div className="max-w-3xl mx-auto relative group">
            <input
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all shadow-2xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              placeholder="Query your documents..."
            />
            <button
              onClick={handleQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? "bg-indigo-600/10 text-indigo-500" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
    }`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}
