"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";

const API = "http://127.0.0.1:8000";

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default function TicketPanel() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newIssue, setNewIssue] = useState("");
  const [newOrder, setNewOrder] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchTickets = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API}/tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const createTicket = async () => {
    if (!newIssue.trim()) return;
    try {
      const res = await fetch(`${API}/admin/create-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: newIssue, order_id: newOrder })
      });
      
      if (res.ok) {
        setShowCreate(false);
        setNewIssue("");
        setNewOrder("");
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
    setIsAdmin(localStorage.getItem("isAdmin") === "true");

    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [tickets]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API}/ticket/${id}?status=${status}`, { method: "PUT" });
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "in_progress": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <aside className="w-80 border-l border-white/5 bg-[#020617] flex flex-col h-screen select-none">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TicketIcon />
          <h2 className="text-sm font-bold tracking-tight uppercase text-white/80">Support Tickets</h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-blue-400"
              title="Create Ticket"
            >
              <PlusIcon />
            </button>
          )}
          <button 
            onClick={fetchTickets}
            className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {showCreate && isAdmin && (
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3 animate-in">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">New Admin Ticket</h3>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-blue-500/50"
              placeholder="Issue description..."
              rows={3}
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
            />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-blue-500/50"
              placeholder="Order ID (Optional)"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={createTicket}
                className="flex-1 py-2 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500"
              >
                Create
              </button>
              <button 
                onClick={() => setShowCreate(false)}
                className="px-3 py-2 bg-white/5 rounded-lg text-xs font-bold hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {refreshing && tickets.length === 0 && (
          <div className="space-y-4 animate-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-16 h-3" />
                  <Skeleton className="w-12 h-3" />
                </div>
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-3" />
              </div>
            ))}
          </div>
        )}

        {!refreshing && tickets.filter(t => isAdmin || t.status !== "resolved").length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center text-center px-4">
            <p className="text-xs text-white/20 font-medium">No active tickets found</p>
          </div>
        )}
        
        {tickets
          .filter(t => isAdmin || t.status !== "resolved")
          .map((t) => (
          <div 
            key={t.ticket_id} 
            className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-white/40 tracking-tighter">
                #{t.ticket_id.slice(0, 8)}
              </span>
              {t.order_id && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 font-mono">
                  Order: {t.order_id}
                </span>
              )}
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(t.status)}`}>
                {t.status.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-sm text-white/80 font-medium leading-relaxed mb-4">
              {t.issue}
            </p>

            {isAdmin && t.status !== "resolved" && (
              <div className="flex gap-2 pt-3 border-t border-white/5">
                {t.status !== "in_progress" && (
                  <button 
                    onClick={() => updateStatus(t.ticket_id, "in_progress")} 
                    className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-bold hover:bg-amber-500/20 transition-colors"
                  >
                    Start
                  </button>
                )}
                <button 
                  onClick={() => updateStatus(t.ticket_id, "resolved")} 
                  className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  Resolve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/[0.01] border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-medium text-white/30 px-2 uppercase tracking-widest">
          <span>Total: {tickets.length}</span>
          <span>Last Update: {lastUpdate}</span>
        </div>
        
        <Link 
          href="/faq" 
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
        >
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Help Center & FAQ
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-blue-500 transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </Link>
      </div>
    </aside>
  );
}