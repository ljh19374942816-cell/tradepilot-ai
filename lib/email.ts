import { Resend } from "resend";
import { db } from "@/lib/db";

type InquiryEmailData = {
  inquiryId: string;
  inquiryNo: string;
  customerName: string;
  customerEmail: string;
  company?: string | null;
  productName: string;
  quantity?: number | null;
  message: string;
  language: string;
};

function htmlEscape(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
}

async function deliver(inquiryId: string, type: string, to: string, subject: string, html: string) {
  const log = await db.emailLog.create({ data: { inquiryId, type, recipient: to, subject } });
  if (!process.env.RESEND_API_KEY) {
    await db.emailLog.update({ where: { id: log.id }, data: { status: "SKIPPED", error: "RESEND_API_KEY is not configured" } });
    return { sent: false, reason: "not-configured" };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({ from: process.env.EMAIL_FROM || "TradePilot AI <onboarding@resend.dev>", to, subject, html });
    if (result.error) throw new Error(result.error.message);
    await db.emailLog.update({ where: { id: log.id }, data: { status: "SENT", providerId: result.data?.id, sentAt: new Date() } });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    await db.emailLog.update({ where: { id: log.id }, data: { status: "FAILED", error: message } });
    return { sent: false, reason: message };
  }
}

export async function sendInquiryEmails(data: InquiryEmailData) {
  const name = htmlEscape(data.customerName);
  const product = htmlEscape(data.productName);
  const no = htmlEscape(data.inquiryNo);
  const isZh = data.language === "zh";
  const customerSubject = isZh ? `我们已收到您的询盘 ${data.inquiryNo}` : `We received your inquiry ${data.inquiryNo}`;
  const customerHtml = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17211d"><div style="padding:28px;background:#0a3d2e;color:white"><b style="font-size:22px">TRADEPILOT AI</b></div><div style="padding:32px;border:1px solid #e4e8e6"><h2>${isZh ? `您好，${name}` : `Hello ${name},`}</h2><p>${isZh ? "感谢您的询盘。我们的出口顾问将在 1 个工作日内与您联系。" : "Thank you for your inquiry. An export specialist will contact you within one business day."}</p><div style="background:#f2f6f4;padding:18px;margin:24px 0"><b>${isZh ? "询盘编号" : "Inquiry reference"}</b><br>${no}<br><br><b>${isZh ? "产品" : "Product"}</b><br>${product}</div><p>${isZh ? "您可以直接回复此邮件补充规格、目的港或采购计划。" : "Reply to this email with specifications, destination port or purchasing plans."}</p></div></div>`;
  const admin = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@tradepilot.local";
  const adminSubject = `[New inquiry] ${data.inquiryNo} - ${data.productName}`;
  const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:680px"><h2>New qualified inquiry</h2><table cellpadding="8" style="border-collapse:collapse"><tr><td><b>Reference</b></td><td>${no}</td></tr><tr><td><b>Customer</b></td><td>${name} (${htmlEscape(data.customerEmail)})</td></tr><tr><td><b>Company</b></td><td>${htmlEscape(data.company || "-")}</td></tr><tr><td><b>Product</b></td><td>${product}</td></tr><tr><td><b>Quantity</b></td><td>${data.quantity || "-"}</td></tr></table><h3>Message</h3><p style="white-space:pre-wrap">${htmlEscape(data.message)}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/inquiries/${data.inquiryId}">Open in TradePilot CRM</a></p></div>`;
  return Promise.all([
    deliver(data.inquiryId, "CUSTOMER_CONFIRMATION", data.customerEmail, customerSubject, customerHtml),
    deliver(data.inquiryId, "ADMIN_NOTIFICATION", admin, adminSubject, adminHtml),
  ]);
}
