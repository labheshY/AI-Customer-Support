"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

export default function InputBox({ messages, setMessages, sessionId }: any) {
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev: any) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    setInput("");

    const payload: any = { query: userMessage };
    if (sessionId) payload.session_id = sessionId;

    const res = await fetch(`${API}/ask`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    let done = false;
    let accumulated = "";

    while (!done) {
      const { value, done: doneReading } = await reader!.read();
      done = doneReading;

      const chunk = decoder.decode(value);
      accumulated += chunk;

      setMessages((prev: any) => {
        const updated = [...prev];
        updated[updated.length - 1].content = accumulated;
        return updated;
      });
    }
  };

  return (
    <div className="w-full max-w-3xl p-4">
      <div className="flex bg-white/10 rounded-full p-2">

        <input
          className="flex-1 bg-transparent px-4 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-violet-600 px-5 rounded-full"
        >
          Send
        </button>

      </div>
    </div>
  );
}