"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";

const API = "http://127.0.0.1:8000";

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default function Sidebar({ sessionId, setSessionId, openLogin, openUserLogin }: any) {
  const [sessions, setSessions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    let uid = localStorage.getItem("user_id");
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/sessions?user_id=${uid}`)
      .then((r) => r.json())
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let uid = localStorage.getItem("user_id");
    if (!uid) {
      uid = "U-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("user_id", uid);
    }

    setUserName(localStorage.getItem("user_name"));
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
    fetchSessions();
  }, []);

  useEffect(() => {
    const handler = () => fetchSessions();
    window.addEventListener("set-session", handler);
    return () => window.removeEventListener("set-session", handler);
  }, []);

  const open = (sid: string) => {
    setSessionId(sid);
    const uid = localStorage.getItem("access_token"); // Use token as check for logged in
    if (uid) {
      localStorage.setItem("session_id", sid);
    } else {
      sessionStorage.setItem("session_id", sid);
    }
  };

  const del = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    
    try {
      await fetch(`${API}/session/${sid}`, { method: "DELETE" });
      setSessions((p) => p.filter((s) => s !== sid));
      if (sid === sessionId) setSessionId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <aside className="w-72 border-r border-white/5 bg-[#020617] flex flex-col h-screen select-none">
      {/* 🔹 BRAND */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ChatIcon />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Copilot</h1>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          Customer Support AI
        </p>
      </div>

      {/* 🔹 NEW CHAT */}
      <div className="px-4 mb-4">
        <button
          onClick={() => {
            setSessionId(null);
            localStorage.removeItem("session_id");
            sessionStorage.removeItem("session_id");
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium"
        >
          <PlusIcon />
          <span>New Conversation</span>
        </button>
      </div>

      {/* 🔹 SESSIONS */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-medium text-white/20 uppercase tracking-wider">Recent Chats</p>
        </div>
        {loading && (
          <div className="px-3 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-24 h-3" />
              </div>
            ))}
          </div>
        )}
        {!loading && sessions.length === 0 && (
          <div className="px-3 py-4 text-xs text-white/20 italic text-center">
            No recent sessions
          </div>
        )}
        {sessions.map((sid) => (
          <div
            key={sid}
            onClick={() => open(sid)}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
              sessionId === sid
                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                : "text-white/60 hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <ChatIcon />
              <span className="text-sm truncate font-medium">
                Chat {sid.slice(0, 6)}
              </span>
            </div>

            <button
              onClick={(e) => del(e, sid)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {/* 🔹 BOTTOM: USER / ADMIN */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg">
            {isAdmin ? "AD" : (userName ? userName.slice(0, 2).toUpperCase() : "GU")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-none mb-1">
              {isAdmin ? "Administrator" : (userName || "Guest User")}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-tighter font-medium">
              {isAdmin ? "Full System Access" : (userName ? "Verified Account" : "Limited Access")}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              localStorage.setItem("isAdmin", "false");
              localStorage.removeItem("session_id");
              localStorage.removeItem("access_token");
              sessionStorage.removeItem("session_id");
              location.reload();
            }}
            className="w-full text-[11px] text-red-400/80 hover:text-red-400 transition-colors font-medium text-center uppercase tracking-wider py-2"
          >
            Exit Admin Mode
          </button>
        ) : (
          <div className="flex flex-col gap-1">
            {userName ? (
              <button
                onClick={() => {
                  localStorage.removeItem("user_name");
                  localStorage.removeItem("user_id");
                  localStorage.removeItem("session_id");
                  localStorage.removeItem("access_token");
                  sessionStorage.removeItem("session_id");
                  location.reload();
                }}
                className="w-full text-[11px] text-red-400/80 hover:text-red-400 transition-colors font-medium text-center uppercase tracking-wider py-1"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={openUserLogin}
                className="w-full text-[11px] text-blue-400/80 hover:text-blue-400 transition-colors font-medium text-center uppercase tracking-wider py-1"
              >
                User Sign In
              </button>
            )}
            <button
              onClick={openLogin}
              className="w-full text-[10px] text-white/20 hover:text-white/40 transition-colors font-medium text-center uppercase tracking-widest py-1"
            >
              Admin Console
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}