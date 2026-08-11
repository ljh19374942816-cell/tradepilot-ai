import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendInquiryEmails } from "@/lib/email";
import { makeInquiryNo } from "@/lib/utils";
import { inquirySchema } from "@/lib/validation";
import { rateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!rateLimit(requestKey(request, "inquiry"), 8, 60 * 60 * 1000).allowed) return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    const parsed = inquirySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid inquiry" }, { status: 400 });
    const data = parsed.data;
    if (data.website) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    const product = await db.product.findFirst({ where: { id: data.productId, active: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const inquiry = await db.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: data.email.toLowerCase() },
        update: { name: data.name, company: data.company || null, phone: data.phone || null, country: data.country, lastSeenAt: new Date() },
        create: { email: data.email.toLowerCase(), name: data.name, company: data.company || null, phone: data.phone || null, country: data.country },
      });
      return tx.inquiry.create({ data: {
        inquiryNo: makeInquiryNo(), customerId: customer.id, subject: `${product.nameEn} inquiry`, message: data.message,
        quantity: data.quantity, targetPrice: data.targetPrice === "" ? null : data.targetPrice, destination: data.destination || null,
        incoterm: data.incoterm, language: data.language, items: { create: { productId: product.id, quantity: data.quantity } },
        events: { create: { type: "CREATED", titleEn: "Inquiry received", titleZh: "询盘已收到", descriptionEn: "Your requirements were saved and are awaiting sales review.", descriptionZh: "您的采购需求已保存，正在等待销售审核。" } },
      }, include: { customer: true } });
    });
    const emailResults = await sendInquiryEmails({ inquiryId: inquiry.id, inquiryNo: inquiry.inquiryNo, customerName: inquiry.customer.name, customerEmail: inquiry.customer.email, company: inquiry.customer.company, productName: data.language === "zh" ? product.nameZh : product.nameEn, quantity: inquiry.quantity, message: inquiry.message, language: inquiry.language });
    return NextResponse.json({ inquiryNo: inquiry.inquiryNo, emailQueued: emailResults.some((result) => result.sent) }, { status: 201 });
  } catch (error) {
    console.error("Inquiry creation failed", error);
    return NextResponse.json({ error: "We could not submit your inquiry. Please try again." }, { status: 500 });
  }
}
