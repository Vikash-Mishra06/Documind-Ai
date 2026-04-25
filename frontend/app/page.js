"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Sparkles, FileText, Zap, 
  ShieldCheck, BrainCircuit, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen selection:bg-indigo-500/30 overflow-x-hidden">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <span className="truncate">DocuMind <span className="text-indigo-500">AI</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push("/login")} className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
              Sign In
            </button>
            <button onClick={() => router.push("/register")} className="bg-zinc-100 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-white transition-all transform active:scale-95 cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 " onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-zinc-800/50 bg-[#09090b] overflow-hidden"
            >
              <div className="flex flex-col gap-4 p-6">
                <button onClick={() => { router.push("/login"); setMobileMenuOpen(false); }} className="text-lg font-medium text-zinc-400 py-2">Sign In</button>
                <button onClick={() => { router.push("/register"); setMobileMenuOpen(false); }} className="bg-indigo-600 text-white px-4 py-4 rounded-xl text-center font-bold">Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs font-bold mb-6 tracking-wide uppercase"
          >
            <Sparkles size={12} />
            Next-Gen RAG Architecture
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500"
          >
            Your Documents, <br className="hidden sm:block" /> Now with a Brain.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed px-2"
          >
            The world's most advanced multi-tenant AI document assistant. Upload PDFs and chat with your files in real-time.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <button onClick={() => router.push("/register")} className="bg-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 group cursor-pointer">
              Start Building <ArrowRight size={18} />
            </button>
            <button onClick={() => window.open("https://github.com/Vikash-Mishra06/Documind-Ai", "_blank")} className="bg-zinc-900 border border-zinc-800 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base cursor-pointer">
              View on GitHub
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard 
            icon={<FileText className="text-indigo-500" />}
            title="Semantic Chat"
            desc="Don't just search PDFs—converse with them. Our LLM extracts precise answers instantly."
          />
          <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="Hybrid RAG"
            desc="Vector embeddings and Redis caching for sub-second query response times."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-emerald-500" />}
            title="Secure Isolation"
            desc="Your data is strictly isolated with JWT-based session security and encryption."
          />
        </div>
      </section>

      {/* --- WORKFLOW STEPS --- */}
      <section className="py-16 bg-zinc-900/30 border-y border-zinc-800/50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Under the Hood</h2>
            <p className="text-zinc-500 text-sm">Professional AI knowledge management pipeline.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Step number="01" title="Upload" label="Chunking" />
            <Step number="02" title="Embed" label="Vectorize" />
            <Step number="03" title="Query" label="Similarity" />
            <Step number="04" title="Resolve" label="Synthesis" />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION (The Mobile Fix) --- */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 sm:p-16 rounded-[2rem] sm:rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-white leading-tight">
              Ready to revolutionize <br /> your workflow?
            </h2>
            <p className="text-indigo-100/80 mb-10 text-base sm:text-lg max-w-xl mx-auto">
              Join the production-ready AI SaaS platform used by modern developers.
            </p>
            <button onClick={() => router.push("/register")} className="w-full sm:w-auto bg-white text-indigo-900 px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform cursor-pointer">
              Get Started It's Free
            </button>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-zinc-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="font-bold text-zinc-400">DocuMind AI © 2026</div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-100">Architecture</a>
            <a href="#" className="hover:text-zinc-100">API Docs</a>
            <a href="#" className="hover:text-zinc-100">Twitter</a>
          </div>
          <div className="text-sm text-zinc-600">Engineered by Vikash Mishra</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-zinc-700 transition-all">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function Step({ number, title, label }) {
  return (
    <div className="text-center group">
      <div className="text-indigo-500 text-[10px] font-black tracking-widest mb-1 opacity-50">{number}</div>
      <h4 className="text-base sm:text-lg font-bold text-zinc-200">{title}</h4>
      <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-tighter">{label}</p>
      <div className="mt-3 h-0.5 w-6 bg-zinc-800 mx-auto rounded-full group-hover:bg-indigo-600 transition-all" />
    </div>
  );
}