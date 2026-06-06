import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Bot, User, Trash2, ArrowLeft, Upload, Paperclip, 
  Sparkles, Loader2, FileText, ChevronDown, MessageSquare,
  Cpu, Shield, Globe, LogIn, LogOut
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../components/AuthProvider";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatPage({ onBack }: { onBack: () => void }) {
  const { user, isAdmin, login, logout, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hi there! Welcome! I’m really glad you’re interested in our research. We spent a lot of time figuring out how to spot disease outbreaks early using online data, while keeping everyone's personal information completely safe. Ask me anything you'd like about how we built it or what we discovered—I’m happy to chat!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        const data = await res.json();
        setIndexedFiles(data.files);
      } catch (err) {
        console.error("Failed to fetch files", err);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Error: Neural connection interrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatus("Indexing...");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown server error" }));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }
      const data = await res.json();
      setIndexedFiles(data.files || []);
      setUploadStatus(data.message || "Knowledge synced.");
      
      const failed = data.results?.filter((r: any) => r.status === "error");
      if (failed?.length > 0) {
        console.warn("Some files failed to index:", failed);
      }

      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus(`Sync failed: ${err.message || "Network error"}`);
      setTimeout(() => setUploadStatus(""), 6000);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();
      setIndexedFiles(data.files || []);
      setUploadStatus("File removed.");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setUploadStatus("Failed to delete.");
    }
  };

  return (
  <div className="fixed inset-0 flex flex-col bg-bg-dark text-[#e0e0e0] font-sans overflow-hidden">

    {/* TOP NAV (mobile-first) */}
    <nav className="h-14 sm:h-16 glass-nav px-4 sm:px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-lg shadow-accent-cyan/20">
            <Cpu size={16} className="sm:size-[18px] text-white" />
          </div>

          <span className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-white uppercase text-[10px] sm:text-sm">
            Federated Intel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
        <div className="hidden sm:block px-4 py-2 rounded-full border border-border-cyan bg-accent-cyan/5 text-accent-cyan max-w-[200px] truncate">
          {uploadStatus ? uploadStatus : `RAG Mode Active (${indexedFiles.length} papers)`}
        </div>

        {user ? (
          <button
            onClick={() => logout()}
            className="px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-border-white hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="px-3 sm:px-4 py-2 rounded-lg bg-accent-cyan text-bg-dark hover:scale-105 transition-all flex items-center gap-2"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Admin Login</span>
          </button>
        )}
      </div>
    </nav>

    {/* MAIN WRAPPER */}
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

      {/* LEFT SIDEBAR (hidden on mobile, becomes drawer-like stack on mobile) */}
      <aside className="hidden lg:flex w-72 border-r border-border-white bg-black/20 p-6 flex-col gap-8">

        {isAdmin ? (
          <div>
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
              Admin: Knowledge Base
              {indexedFiles.length > 0 && (
                <span className="text-accent-cyan">{indexedFiles.length} items</span>
              )}
            </h3>

            <div className="space-y-2">
              {indexedFiles.length === 0 && !isUploading && (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                  <p className="text-[10px] text-white/20 italic">
                    No papers uploaded. Add your thesis PDF/Word files.
                  </p>
                </div>
              )}

              {indexedFiles.map((filename, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/5 border border-border-white flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        i % 2 === 0 ? "bg-accent-cyan" : "bg-accent-purple"
                      }`}
                    />
                    <div className="text-[11px] font-medium text-white/60 truncate">
                      {filename}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(filename);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/30 flex items-center gap-3 hover:bg-accent-cyan/10 transition-all mt-2"
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin text-accent-cyan" />
                ) : (
                  <Upload size={14} className="text-accent-cyan" />
                )}
                <div className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">
                  {isUploading ? "Syncing..." : "Upload Document"}
                </div>
              </button>

              <input
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.md"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <Shield className="text-white/10 mb-4" size={32} />
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-bold">
              Secure Protocol
            </h3>
            <p className="text-[10px] text-white/20 leading-relaxed italic">
              The knowledge base references are encrypted for guests.
            </p>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">
            Recent Research
          </h3>

          <div className="space-y-3">
            {[
              "Neural Aggregation Protocols",
              "Differentially Private SGD",
              "Federated Outbreak Benchmarks",
              "Latent Space Analysis",
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => setInput(topic)}
                className="w-full text-left text-[11px] text-white/30 hover:text-accent-cyan transition-colors border-l border-white/5 hover:border-accent-cyan/30 pl-3 py-1"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE */}
      <main className="flex-1 flex flex-col bg-black/10 overflow-hidden">

        {/* HEADER */}
        <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-3 sm:pb-4">
          <h1 className="text-xl sm:text-3xl font-light tracking-tight text-white">
            Research <span className="text-accent-cyan">Workspace</span>
          </h1>
          <p className="text-white/30 text-[10px] sm:text-xs mt-2">
            Interactive analysis engine for federated systems.
          </p>
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8">
          <div
            className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-6 scroll-smooth scrollbar-hide"
            ref={scrollRef}
          >
            <div className="max-w-3xl space-y-6 sm:space-y-8">

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 sm:gap-5 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === "ai"
                        ? "bg-gradient-to-tr from-accent-cyan to-accent-purple"
                        : "bg-white/10"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <Bot size={14} className="sm:size-[16px]" />
                    ) : (
                      <User size={14} />
                    )}
                  </div>

                  <div
                    className={`flex flex-col space-y-2 max-w-[85%] ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "ai"
                          ? "bg-white/5 border border-border-white"
                          : "bg-accent-cyan/5 border border-border-cyan"
                      }`}
                    >
                      <div className="markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-accent-cyan to-accent-purple flex items-center justify-center animate-pulse">
                    <Sparkles size={14} />
                  </div>
                  <div className="bg-white/5 border border-border-white px-4 py-3 rounded-2xl flex gap-1.5 items-center">
                    <span className="w-1 h-1 bg-accent-cyan rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-accent-cyan rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-accent-cyan rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INPUT */}
          <div className="pb-4 sm:pb-8 pt-3 sm:pt-4">
            <div className="max-w-3xl relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about methodology, results..."
                className="w-full bg-white/5 border border-border-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm focus:outline-none focus:border-accent-cyan/30"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-accent-cyan text-bg-dark flex items-center justify-center disabled:opacity-20"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL (hidden on mobile/tablet) */}
      <aside className="hidden xl:flex w-80 border-l border-border-white bg-black/30 flex-col">

        <div className="p-6">
          <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">
            Global Pattern
          </h3>

          <div className="aspect-[4/3] rounded-2xl bg-[#0a0f24] relative overflow-hidden border border-border-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#22d3ee_0%,_transparent_70%)]" />
          </div>
        </div>
      </aside>
    </div>

    {/* LOGIN MODAL (unchanged, already responsive enough) */}
    <AnimatePresence>
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogin(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Admin Access
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              />

              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              />

              {loginError && (
                <p className="text-red-500 text-[11px]">{loginError}</p>
              )}

              <button
                onClick={async () => {
                  setLoginError("");
                  const success = await login(loginEmail, loginPassword);
                  if (success) {
                    setShowLogin(false);
                    setLoginEmail("");
                    setLoginPassword("");
                  } else {
                    setLoginError("Authorization failed.");
                  }
                }}
                className="w-full py-3 sm:py-4 bg-accent-cyan text-bg-dark font-bold rounded-xl"
              >
                Verify Protocol
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
);
}
