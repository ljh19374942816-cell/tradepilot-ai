import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendInquiryEmails } from "@/lib/email";
import { rateLimit, requestKey } from "@/lib/rate-limit";
import { makeInquiryNo } from "@/lib/utils";
import { buyerIntentSchema } from "@/lib/validation";

function scoreIntent(data: ReturnType<typeof buyerIntentSchema.parse>, moq: number) {
  let score = data.quantity >= moq * 5 ? 25 : data.quantity >= moq ? 15 : 5;
  score += { "within-30": 25, "one-to-three": 18, "three-to-six": 10, researching: 3 }[data.timeline];
  score += { approved: 20, estimated: 12, unknown: 4 }[data.budgetStatus];
  score += { "decision-maker": 20, influencer: 12, researcher: 5 }[data.decisionRole];
  if (data.targetPrice !== "" && data.targetPrice !== undefined) score += 10;
  const level = score >= 70 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";
  return { score, level, priority: level === "HIGH" ? 3 : level === "MEDIUM" ? 2 : 1 };
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(requestKey(request, "buyer-intent"), 8, 60 * 60 * 1000).allowed) return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
    const parsed = buyerIntentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid questionnaire" }, { status: 400 });
    const data = parsed.data;
    if (data.website) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    const product = await db.product.findFirst({ where: { id: data.productId, active: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const rating = scoreIntent(data, product.moq);
    const summaryEn = `${data.quantity.toLocaleString()} units of ${product.nameEn} to ${data.destination}; ${data.incoterm}; timeline ${data.timeline}; budget ${data.budgetStatus}.`;
    const summaryZh = `采购 ${product.nameZh} ${data.quantity.toLocaleString()} 件，发往 ${data.destination}；${data.incoterm}；采购周期 ${data.timeline}；预算状态 ${data.budgetStatus}。`;
    const summary = data.language === "zh" ? summaryZh : summaryEn;
    const inquiry = await db.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({ where: { email: data.email.toLowerCase() }, update: { name: data.name, company: data.company, phone: data.phone || null, country: data.country, lastSeenAt: new Date(), source: "buyer-intent-wizard" }, create: { email: data.email.toLowerCase(), name: data.name, company: data.company, phone: data.phone || null, country: data.country, source: "buyer-intent-wizard" } });
      return tx.inquiry.create({ data: { inquiryNo: makeInquiryNo(), customerId: customer.id, subject: `${product.nameEn} qualified request`, message: data.requirements, quantity: data.quantity, targetPrice: data.targetPrice === "" ? null : data.targetPrice, destination: data.destination, incoterm: data.incoterm, language: data.language, priority: rating.priority, intentScore: rating.score, intentLevel: rating.level, intentSummary: summary, items: { create: { productId: product.id, quantity: data.quantity } }, events: { create: { type: "QUALIFIED", titleEn: "Buying requirements received", titleZh: "采购需求已提交", descriptionEn: "The guided questionnaire was completed and sent to our export team.", descriptionZh: "分步采购问卷已完成，并已提交给出口顾问。" } } }, include: { customer: true } });
    });
    const emailResults = await sendInquiryEmails({ inquiryId: inquiry.id, inquiryNo: inquiry.inquiryNo, customerName: inquiry.customer.name, customerEmail: inquiry.customer.email, company: inquiry.customer.company, productName: data.language === "zh" ? product.nameZh : product.nameEn, quantity: inquiry.quantity, message: `${summary}\n\n${data.requirements}`, language: data.language });
    return NextResponse.json({ inquiryNo: inquiry.inquiryNo, score: rating.score, level: rating.level, summary, emailQueued: emailResults.some((item) => item.sent) }, { status: 201 });
  } catch (error) {
    console.error("Buyer intent submission failed", error);
    return NextResponse.json({ error: "We could not process the questionnaire." }, { status: 500 });
  }
}
