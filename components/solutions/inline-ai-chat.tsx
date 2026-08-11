"use client";

import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

export function InlineAiChat({ language }: { language: "en" | "zh" }) {
  const zh = language === "zh";
  const [messages, setMessages] = useState<Message[]>(() => [{ role: "assistant", content: zh ? "您好，我已读取当前产品数据库。请告诉我您关注的产品、数量或认证要求。" : "Hello. I have access to the current product database. Tell me the product, quantity or certification you need." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages([...next, { role: "assistant", content: "" }]); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, language, messages: next.slice(-12) }) });
      if (!response.ok || !response.body) { const result = await response.json(); throw new Error(result.error || "AI unavailable"); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let complete = "";
      while (true) { const { value, done } = await reader.read(); if (done) break; complete += decoder.decode(value, { stream: true }); setMessages([...next, { role: "assistant", content: complete }]); }
    } catch (error) {
      setMessages([...next, { role: "assistant", content: error instanceof Error ? error.message : (zh ? "AI 暂时不可用" : "AI is temporarily unavailable") }]);
    } finally { setLoading(false); }
  }

  return <section className="overflow-hidden rounded-[8px] border border-[#d9e3de] bg-white shadow-[0_18px_50px_rgba(7,60,44,.1)]">
    <header className="flex items-center justify-between bg-[#073c2c] px-5 py-4 text-white"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[6px] bg-[#d8f06d] text-[#073c2c]"><Bot size={21} /></span><div><h2 className="text-sm font-bold">TradePilot DeepSeek</h2><p className="mt-0.5 text-[11px] text-white/60">{zh ? "产品知识库已连接" : "Product knowledge connected"}</p></div></div><span className="flex items-center gap-1.5 text-[10px] text-[#d8f06d]"><Sparkles size={13} />deepseek-chat</span></header>
    <div className="h-[420px] space-y-3 overflow-y-auto bg-[#f4f7f5] p-4 sm:p-5">{messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[86%] whitespace-pre-wrap rounded-[7px] px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#0b5d43] text-white" : "border border-[#e0e7e3] bg-white text-[#304039]"}`}>{message.content || <Loader2 className="animate-spin text-[#0b5d43]" size={17} />}</div></div>)}<div ref={bottom} /></div>
    <div className="flex gap-2 overflow-x-auto border-t border-[#e1e8e4] px-4 py-2.5">{(zh ? ["Atlas 2000 起订量是多少？", "支持哪些 OEM 定制？", "交期需要多久？"] : ["What is the Atlas 2000 MOQ?", "Which OEM options are available?", "What is the lead time?"]).map((question) => <button key={question} onClick={() => send(question)} className="shrink-0 rounded-full border border-[#cfdad5] px-3 py-1.5 text-[11px] text-[#46554e] hover:border-[#0b5d43]">{question}</button>)}</div>
    <form onSubmit={(event) => { event.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-[#e1e8e4] p-4"><textarea aria-label={zh ? "输入产品问题" : "Enter product question"} rows={2} value={input} onChange={(event) => setInput(event.target.value)} placeholder={zh ? "输入产品、规格、MOQ、认证或交期问题..." : "Ask about products, specifications, MOQ, certifications or lead time..."} className="min-h-12 flex-1 resize-none rounded-[6px] border border-[#d4ddd8] px-3 py-2.5 text-sm outline-none focus:border-[#0b5d43]" /><Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label={zh ? "发送" : "Send"}><Send size={17} /></Button></form>
  </section>;
}
