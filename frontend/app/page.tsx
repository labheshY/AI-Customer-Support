"use client";

import Sidebar from "@/components/Sidebar";
import ChatSection from "@/components/ChatSection";
import TicketPanel from "@/components/TicketPanel";
import ErrorBoundary from "@/components/ErrorBoundary";
import TicketModal from "@/components/TicketModal";
import EmailModal from "@/components/EmailModal";
import { useEffect, useState } from "react";

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check sessionStorage first (for guests), then localStorage (as fallback)
    const stored = sessionStorage.getItem("session_id") || localStorage.getItem("session_id");
    if (stored) {
      setSessionId(stored);
    }

    const handler = () => setShowTicketModal(true);
    const emailHandler = () => setShowEmailModal(true);
    
    window.addEventListener("open-ticket-modal", handler);
    window.addEventListener("open-email-modal", emailHandler);
    
    return () => {
      window.removeEventListener("open-ticket-modal", handler);
      window.removeEventListener("open-email-modal", emailHandler);
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      setSessionId(e.detail);
    };

    window.addEventListener("set-session", handler);
    return () => window.removeEventListener("set-session", handler);
  }, []);
  
  return (
    <div className="h-screen w-full bg-[#020617] text-white flex overflow-hidden font-sans">
      <div className="hidden lg:flex flex-none">
        <ErrorBoundary fallbackName="Sidebar">
          <Sidebar
            sessionId={sessionId}
            setSessionId={setSessionId}
            openLogin={() => setShowLogin(true)}
            openUserLogin={() => setShowUserLogin(true)}
          />
        </ErrorBoundary>
      </div>
      
      <div className="flex-1 min-w-0 h-screen flex flex-col">
        <ErrorBoundary fallbackName="Chat Interface">
          <ChatSection sessionId={sessionId} />
        </ErrorBoundary>
      </div>
      
      <div className="hidden xl:flex flex-none">
        <ErrorBoundary fallbackName="Ticket Panel">
          <TicketPanel />
        </ErrorBoundary>
      </div>
    
      {/* Ticket Creation Modal */}
      <TicketModal 
        isOpen={showTicketModal} 
        onClose={() => setShowTicketModal(false)} 
      />

      {/* Email Sending Modal */}
      <EmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
      />

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />
          
          <div className="relative w-full max-w-sm bg-[#0a101f] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                <LockIcon />
              </div>
              <h2 className="text-xl font-bold text-white/90">Administrator Login</h2>
              <p className="text-sm text-white/40 mt-1">Authorized personnel only</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Access Password</label>
                <input
                  type="password"
                  autoFocus
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/10"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      document.getElementById("admin-login-btn")?.click();
                    }
                  }}
                />
              </div>

              <button
                id="admin-login-btn"
                onClick={async () => {
                  try {
                    const res = await fetch("http://127.0.0.1:8000/admin/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password: adminPassword }),
                    });

                    const data = await res.json();

                    if (data.status === "ok") {
                      localStorage.setItem("isAdmin", "true");
                      localStorage.setItem("access_token", data.access_token);
                      localStorage.removeItem("session_id");
                      setShowLogin(false);
                      location.reload();
                    } else {
                      alert("Invalid access credentials");
                    }
                  } catch (e) {
                    alert("Connection failed");
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                Authenticate
              </button>
              
              <button
                onClick={() => setShowLogin(false)}
                className="w-full py-2 text-xs text-white/30 hover:text-white/50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Login Modal */}
      {showUserLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUserLogin(false)}
          />
          
          <div className="relative w-full max-w-sm bg-[#0a101f] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                <LockIcon />
              </div>
              <h2 className="text-xl font-bold text-white/90">User Login</h2>
              <p className="text-sm text-white/40 mt-1">Access your chat history and orders</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  autoFocus
                  placeholder="amit@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/10"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      document.getElementById("user-login-btn")?.click();
                    }
                  }}
                />
              </div>

              <button
                id="user-login-btn"
                onClick={async () => {
                  try {
                    const res = await fetch("http://127.0.0.1:8000/user/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, password: userPassword }),
                    });

                    const data = await res.json();

                    if (data.status === "ok") {
                      localStorage.setItem("user_id", data.user_id);
                      localStorage.setItem("user_name", data.name);
                      localStorage.setItem("access_token", data.access_token);
                      localStorage.removeItem("session_id");
                      setShowUserLogin(false);
                      location.reload();
                    } else {
                      alert("Invalid credentials");
                    }
                  } catch (e) {
                    alert("Connection failed");
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                Sign In
              </button>
              
              <button
                onClick={() => setShowUserLogin(false)}
                className="w-full py-2 text-xs text-white/30 hover:text-white/50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}