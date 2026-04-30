"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Ticket = {
  ticket_id: string;
  order_id?: string;
  user_id?: string;
  issue: string;
  status: "created" | "in_progress" | "resolved";
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  created:     { label: "Open",        color: "text-amber-400  bg-amber-400/10  border-amber-400/20",  dot: "bg-amber-400" },
  in_progress: { label: "In Progress", color: "text-blue-400   bg-blue-400/10   border-blue-400/20",   dot: "bg-blue-400 animate-pulse" },
  resolved:    { label: "Resolved",    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
};

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
  </svg>
);

export default function TicketPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "created" | "in_progress" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const fetchTickets = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch tickets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
    setIsUser(!!localStorage.getItem("access_token"));
    fetchTickets();
    // Poll every 30 seconds for new tickets
    const interval = setInterval(fetchTickets, 30_000);
    
    const refreshHandler = () => fetchTickets();
    window.addEventListener("refresh-tickets", refreshHandler);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-tickets", refreshHandler);
    };
  }, []);

  const updateStatus = async (ticketId: string, newStatus: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setUpdatingId(ticketId);
    try {
      await fetch(`${API}/ticket/${ticketId}?status=${newStatus}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === ticketId ? { ...t, status: newStatus as Ticket["status"] } : t
        )
      );
    } catch (e) {
      console.error("Failed to update ticket", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const counts = {
    all: tickets.length,
    created: tickets.filter((t) => t.status === "created").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  if (!isAdmin && !isUser) {
    return (
      <aside className="w-80 border-l border-white/5 bg-[#020617] flex flex-col h-screen select-none">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TicketIcon />
            <h2 className="text-sm font-bold tracking-tight text-white/60">Support Tickets</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-white/20 font-medium uppercase tracking-widest">Sign in required</p>
            <p className="text-[11px] text-white/10">Sign in to view and manage your tickets.</p>
          </div>
        </div>
        {/* Footer Links */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between mt-auto">
          <Link href="/faq" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-bold">
            FAQ
          </Link>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-email-modal"))}
            className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-bold"
          >
            Help Center
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-white/5 bg-[#020617] flex flex-col h-screen select-none">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <TicketIcon />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white/80">Tickets</h2>
            <p className="text-[10px] text-white/20 font-medium">{counts.all} total</p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); fetchTickets(); }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
          title="Refresh"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-3 pb-1 flex gap-1">
        {(["all", "created", "in_progress", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${
              filter === f
                ? "bg-white/10 text-white/80"
                : "text-white/20 hover:text-white/40 hover:bg-white/5"
            }`}
          >
            {f === "all" ? `All ${counts.all}` : f === "in_progress" ? `Active ${counts.in_progress}` : f === "created" ? `Open ${counts.created}` : `Done ${counts.resolved}`}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">
        {loading && (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 animate-pulse space-y-2">
                <div className="h-2.5 bg-white/10 rounded w-16" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <p className="text-xs text-white/20 font-medium">No tickets found</p>
            <p className="text-[10px] text-white/10">
              {filter === "all" ? "No support tickets yet." : `No ${filter.replace("_", " ")} tickets.`}
            </p>
          </div>
        )}

        {!loading && filtered.map((ticket) => {
          const cfg = statusConfig[ticket.status] ?? statusConfig.created;
          return (
            <div
              key={ticket.ticket_id}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3 space-y-2.5 hover:bg-white/[0.05] transition-colors"
            >
              {/* Ticket ID + Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-white/30 tracking-tight">
                  {ticket.ticket_id}
                </span>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Issue Text */}
              <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">
                {ticket.issue}
              </p>

              {/* Meta */}
              {(ticket.order_id || ticket.user_id) && (
                <div className="flex flex-wrap gap-1">
                  {ticket.order_id && (
                    <span className="text-[9px] font-mono bg-white/5 text-white/30 px-1.5 py-0.5 rounded">
                      {ticket.order_id}
                    </span>
                  )}
                  {ticket.user_id && (
                    <span className="text-[9px] font-mono bg-white/5 text-white/20 px-1.5 py-0.5 rounded">
                      {ticket.user_id.slice(0, 8)}
                    </span>
                  )}
                </div>
              )}

              {/* Status Update Actions */}
              {isAdmin && (
                <div className="flex gap-1 pt-0.5">
                  {ticket.status !== "in_progress" && ticket.status !== "resolved" && (
                    <button
                      disabled={updatingId === ticket.ticket_id}
                      onClick={() => updateStatus(ticket.ticket_id, "in_progress")}
                      className="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-40"
                    >
                      {updatingId === ticket.ticket_id ? "..." : "Start"}
                    </button>
                  )}
                  {ticket.status !== "resolved" && (
                    <button
                      disabled={updatingId === ticket.ticket_id}
                      onClick={() => updateStatus(ticket.ticket_id, "resolved")}
                      className="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                    >
                      {updatingId === ticket.ticket_id ? "..." : "Resolve"}
                    </button>
                  )}
                  {ticket.status === "resolved" && (
                    <button
                      disabled={updatingId === ticket.ticket_id}
                      onClick={() => updateStatus(ticket.ticket_id, "created")}
                      className="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-white/5 border border-white/10 text-white/30 hover:bg-white/10 transition-all disabled:opacity-40"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between mt-auto">
        <Link href="/faq" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-bold">
          FAQ
        </Link>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("open-email-modal"))}
          className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-bold"
        >
          Help Center
        </button>
      </div>
    </aside>
  );
}