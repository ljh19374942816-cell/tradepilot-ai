import OpenAI from "openai";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSchema } from "@/lib/validation";
import { rateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(requestKey(request, "chat"), 30, 10 * 60 * 1000).allowed) return NextResponse.json({ error: "Chat limit reached. Please try again later." }, { status: 429 });
    if (!process.env.DEEPSEEK_API_KEY) return NextResponse.json({ error: "AI assistant is not configured. Add DEEPSEEK_API_KEY to .env." }, { status: 503 });
    const parsed = chatSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
    const { messages, language, sessionId } = parsed.data;
    const products = await db.product.findMany({ where: { active: true }, select: { nameEn: true, nameZh: true, summaryEn: true, summaryZh: true, description: true, priceMin: true, moq: true, leadTime: true, specs: true } });
    const knowledge = products.map((p) => JSON.stringify(p)).join("\n");
    const system = `You are TradePilot AI, a 24-hour B2B export sales assistant representing founder Xingze. Reply in ${language === "zh" ? "Chinese" : "English"}.

# Your Goal
Turn every visitor into a demo-ready lead, then hand off to Xingze (the founder).

# Dialogue Flow (follow in order)
1. Greet + identify: Ask what industry, team size, and how they currently handle customer inquiries
2. Find pain points (ask, don't guess): Late-night inquiries unanswered? Customer service too costly? Multi-language follow-up slow? Inquiry management messy?
3. Value proposition: After confirming pain points, explain in 2-3 sentences how TradePilot solves it. Do NOT list features.
4. Offer demo: Suggest a 2-minute live demo, provide booking link or ask for preferred time
5. Hand off: When customer asks pricing, shows buying intent, or requests deep discussion → suggest talking to Xingze directly

# Human Handoff Rules
- If user asks for a human ("human", "real person", "人工", "真人", "老板") → immediately offer to connect with Xingze, do not retain
- If user repeatedly asks the same question twice or expresses dissatisfaction ("答非所问", "听不懂", "not helpful") → say "Let me have our founder explain this in detail" and suggest handoff
- If the question is beyond your knowledge → honestly say "I'm not sure about this, let me have Xingze confirm" and suggest handoff
- When handing off, reassure: "Xingze is the founder, he'll get back to you shortly"

# Hard Rules
- Do NOT quote any prices (pricing is decided by Xingze)
- Do NOT promise specific results or numbers unless confirmed
- No empty buzzwords ("industry-leading", "most professional", "行业领先")
- Use ONLY the product facts below for product claims. Never invent certification, pricing, stock or delivery promises
- Clearly label prices as indicative
- When buyer shows purchase intent, ask for quantity, destination, target price and incoterm, then recommend the inquiry form
- Keep messages under 5 lines. Be concise and professional, like an experienced export sales veteran

# Product Knowledge
${knowledge}`;
    const conversation = await db.conversation.upsert({ where: { sessionId }, update: { language }, create: { sessionId, language } });
    const latestUser = messages[messages.length - 1];
    if (latestUser.role === "user") await db.chatMessage.create({ data: { conversationId: conversation.id, role: "user", content: latestUser.content } });
    const deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com" });
    const stream = await deepseek.chat.completions.create({ model: process.env.DEEPSEEK_MODEL || "deepseek-chat", stream: true, temperature: 0.2, messages: [{ role: "system", content: system }, ...messages.map((m) => ({ role: m.role, content: m.content }))] });
    let complete = "";
    const body = new ReadableStream({ async start(controller) { const encoder = new TextEncoder(); try { for await (const chunk of stream) { const text = chunk.choices[0]?.delta?.content || ""; if (text) { complete += text; controller.enqueue(encoder.encode(text)); } } if (complete) await db.chatMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: complete } }); controller.close(); } catch (error) { console.error("DeepSeek stream failed", error); controller.error(error); } } });
    return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache, no-transform" } });
  } catch (error) {
    console.error("Chat request failed", error);
    return NextResponse.json({ error: "AI assistant is temporarily unavailable." }, { status: 500 });
  }
}
