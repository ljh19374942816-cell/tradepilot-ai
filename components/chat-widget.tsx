"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ language }: { language: "en" | "zh" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [{ role: "assistant", content: language === "zh" ? "您好，我是 TradePilot AI。您可以问我产品规格、MOQ、认证、交期或 OEM 方案。" : "Hi, I'm TradePilot AI. Ask me about specifications, MOQ, certifications, lead time or OEM options." }]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottom = useRef<HTMLDivElement>(null);
  const zh = language === "zh";
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages([...next, { role: "assistant", content: "" }]); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, language, messages: next.slice(-12) }) });
      if (!response.ok || !response.body) { const error = await response.json(); throw new Error(error.error || "Chat unavailable"); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let complete = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; complete += decoder.decode(value, { stream: true }); setMessages([...next, { role: "assistant", content: complete }]); }
    } catch (error) {
      setMessages([...next, { role: "assistant", content: error instanceof Error ? error.message : "Chat unavailable" }]);
    } finally { setLoading(false); }
  }

  return <>
    <AnimatePresence>{open && <motion.aside initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} className="fixed bottom-24 right-4 z-40 flex h-[min(620px,calc(100vh-120px))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-[8px] border border-[#dce5e0] bg-white shadow-[0_24px_80px_rgba(10,42,31,.25)] sm:right-6">
      <header className="flex items-center justify-between bg-[#073c2c] px-4 py-3.5 text-white"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-[5px] bg-[#d8f06d] text-[#073c2c]"><Bot size={20} /></span><div><div className="text-sm font-bold">TradePilot AI</div><div className="flex items-center gap-1.5 text-[11px] text-[#c7d7d0]"><span className="size-1.5 rounded-full bg-[#d8f06d]" />{zh ? "产品顾问在线" : "Product specialist online"}</div></div></div><button className="grid size-9 place-items-center rounded-[5px] hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f5f8f6] p-4">{messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[86%] whitespace-pre-wrap rounded-[7px] px-3.5 py-2.5 text-[13px] leading-5 ${m.role === "user" ? "bg-[#0b5d43] text-white" : "border border-[#e1e7e4] bg-white text-[#28362f]"}`}>{m.content || <Loader2 className="animate-spin text-[#0b5d43]" size={16} />}</div></div>)}<div ref={bottom} /></div>
      {messages.length <= 1 && <div className="flex gap-2 overflow-x-auto border-t border-[#e2e8e4] px-3 py-2">{(zh ? ["Atlas 2000 的 MOQ？", "有哪些认证？"] : ["MOQ for Atlas 2000?", "Which certifications?"]).map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-[#cfdad5] px-3 py-1.5 text-[11px] text-[#405049] hover:border-[#0b5d43]">{q}</button>)}</div>}
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-[#e2e8e4] bg-white p-3"><textarea aria-label="Chat message" rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder={zh ? "输入您的问题..." : "Ask about our products..."} className="max-h-24 min-h-10 flex-1 resize-none rounded-[6px] border border-[#d4ddd8] px-3 py-2.5 text-sm outline-none focus:border-[#0b5d43]" /><Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send"><Send size={17} /></Button></form>
      <div className="bg-white pb-2 text-center text-[10px] text-[#8a9690]">{zh ? "AI 可能出错，关键商务条款请与销售确认" : "AI can make mistakes. Confirm commercial terms with sales."}</div>
    </motion.aside>}</AnimatePresence>
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }} onClick={() => setOpen(!open)} className="live-dot fixed bottom-5 right-4 z-40 grid size-14 place-items-center rounded-full bg-[#0b5d43] text-white shadow-xl sm:right-6" aria-label="Open AI assistant">{open ? <X size={22} /> : <span className="relative"><MessageCircle size={24} /><Sparkles className="absolute -right-2 -top-2 text-[#d8f06d]" size={13} /></span>}</motion.button>
  </>;
}
