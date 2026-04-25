"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://documind-ai-klfw.onrender.com";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success State: Redirect to login
        router.push("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden px-4 py-12">
  
  {/* Background Orbs */}
  <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
  <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />

  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    // 3. Changed 'p-8' to 'p-6 sm:p-8' so the card internal space is tighter on mobile
    // 4. Added 'my-auto' to keep it centered when scrolling
    className="w-full max-w-md p-6 sm:p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 my-auto"
  >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-zinc-500 text-sm mt-1 text-center">
            Join DocuMind AI and start querying your knowledge base.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 ml-1">FULL NAME</label>
            <input
              type="text"
              required
              className="w-full p-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              placeholder="Vikash Mishra"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 ml-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              className="w-full p-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              placeholder="vikash@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 ml-1">PASSWORD</label>
            <input
              type="password"
              required
              className="w-full p-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-zinc-100 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Free Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-zinc-500 text-[11px] uppercase tracking-widest font-medium">
          <ShieldCheck size={14} className="text-indigo-500" />
          Enterprise-grade security
        </div>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
