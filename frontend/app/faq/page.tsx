"use client";

import Link from "next/link";
import { useState } from "react";

const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const faqs = [
  {
    question: "How can I track my order?",
    answer: "You can track your order by asking our AI assistant or by visiting the 'Orders' section in your account dashboard. You'll need your Order ID starting with 'ORD'."
  },
  {
    question: "What is your refund policy?",
    answer: "We offer a 30-day money-back guarantee on all unused products. Simply create a support ticket, and our team will process your request within 2-3 business days."
  },
  {
    question: "How do I create a support ticket?",
    answer: "If our AI assistant cannot resolve your issue, you can create a ticket directly through the Chat interface or by clicking the 'New Ticket' button in the sidebar."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and JWT-based authentication to ensure your personal data and chat history remain private."
  },
  {
    question: "Can I talk to a human agent?",
    answer: "Yes. If the AI cannot help, you can request a human agent through a support ticket. Our team is available Mon-Fri, 9 AM - 6 PM EST."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <main className="max-w-3xl mx-auto px-6 py-20 relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft />
          </div>
          <span className="text-sm font-medium tracking-tight">Back to Chat</span>
        </Link>

        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/40 max-w-xl leading-relaxed">
            Everything you need to know about our platform and support services. Can't find what you're looking for? 
            <Link href="/" className="text-blue-500 hover:underline ml-1">Ask our AI</Link>.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className={`group border rounded-2xl transition-all duration-300 ${
                openIndex === i 
                  ? "bg-white/5 border-white/20 shadow-lg shadow-blue-900/10" 
                  : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-6 text-left"
              >
                <span className={`text-lg font-semibold transition-colors ${openIndex === i ? "text-white" : "text-white/70"}`}>
                  {faq.question}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/10 transition-transform duration-300 ${openIndex === i ? "rotate-180 bg-blue-600 border-blue-500" : ""}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-8 text-white/50 leading-relaxed text-[15px]">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 text-center">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-sm text-white/40 mb-6">Our support team is ready to assist you with any inquiries.</p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Start a Conversation
          </Link>
        </div>
      </main>
    </div>
  );
}
