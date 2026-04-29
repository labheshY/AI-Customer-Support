"use client";

import { useEffect, useRef, useState } from "react";

const API = "http://127.0.0.1:8000";

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

export default function ChatSection({ sessionId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    fetch(`${API}/chats/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      })
      .catch(() => setMessages([]));
  }, [sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const tempMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(tempMessages);
    setInput("");
    setLoading(true);

    try {
      const uid = localStorage.getItem("user_id");
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, session_id: sessionId, user_id: uid }),
      });

      const data = await res.json();
      
      if (!sessionId && data.session_id) {
        localStorage.setItem("session_id", data.session_id);
        window.dispatchEvent(new CustomEvent("set-session", { detail: data.session_id }));
      }

      setMessages([...tempMessages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages([...tempMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#020617] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide text-white/80">
            {sessionId ? `SESSION ${sessionId.slice(0, 8)}` : "NEW CONVERSATION"}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
            v1.0.4 - Production
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar relative z-0">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.length === 0 && !loading && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-in">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                <BotIcon />
              </div>
              <h3 className="text-xl font-bold text-white/90">How can I help you today?</h3>
              <p className="text-sm text-white/40 max-w-xs">
                I can assist with order tracking, refund requests, and general product inquiries.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`flex gap-4 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-white/10 text-white/60"
                }`}>
                  {m.role === "user" ? "U" : <BotIcon />}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "bg-white/5 border border-white/10 text-white/90"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in">
              <div className="flex gap-4 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60">
                  <BotIcon />
                </div>
                <div className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 flex items-center gap-2">
                  <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
            <div className="relative flex items-center gap-2 p-2 bg-[#0a101f] border border-white/10 rounded-2xl shadow-2xl focus-within:border-blue-500/50 transition-all">
              <input
                className="flex-1 bg-transparent px-4 py-3 outline-none placeholder:text-white/20 text-sm"
                placeholder="Describe your issue or ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  input.trim() && !loading
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                <SendIcon />
              </button>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-center text-white/20 font-medium tracking-tight">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </main>
  );
}