import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, requestKey } from "@/lib/rate-limit";
import { inquiryLookupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(requestKey(request, "inquiry-status"), 20, 15 * 60 * 1000).allowed) return NextResponse.json({ error: "Too many lookup attempts" }, { status: 429 });
  const parsed = inquiryLookupSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check the inquiry number and email." }, { status: 400 });
  const data = parsed.data;
  const inquiry = await db.inquiry.findFirst({ where: { inquiryNo: data.inquiryNo.toUpperCase(), customer: { email: data.email.toLowerCase() } }, include: { customer: { select: { name: true } }, items: { include: { product: { select: { nameEn: true, nameZh: true } } } }, events: { where: { visibleToBuyer: true }, orderBy: { createdAt: "desc" } } } });
  if (!inquiry) return NextResponse.json({ error: data.language === "zh" ? "未找到匹配的询盘，请检查编号和邮箱。" : "No matching inquiry was found. Check the reference and email." }, { status: 404 });
  const events = inquiry.events.length ? inquiry.events : [{ id: "created", type: "CREATED", titleEn: "Inquiry received", titleZh: "询盘已收到", descriptionEn: "Your request is in our system.", descriptionZh: "您的询盘已进入系统。", createdAt: inquiry.createdAt }];
  return NextResponse.json({ inquiryNo: inquiry.inquiryNo, status: inquiry.status, product: data.language === "zh" ? inquiry.items[0]?.product.nameZh : inquiry.items[0]?.product.nameEn, assignedTo: inquiry.assignedTo, nextFollowUp: inquiry.nextFollowUp, updatedAt: inquiry.updatedAt, events: events.map((event) => ({ id: event.id, type: event.type, title: data.language === "zh" ? event.titleZh : event.titleEn, description: data.language === "zh" ? event.descriptionZh : event.descriptionEn, createdAt: event.createdAt })) });
}
