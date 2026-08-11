import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const baseUrl = "http://127.0.0.1:3000";
const email = "workflow.verification@example.com";

async function main() {
  await cleanup();
  const product = await db.product.findFirstOrThrow({ where: { active: true } });

  const chatResponse = await fetch(`${baseUrl}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: crypto.randomUUID(), language: "zh", messages: [{ role: "user", content: "Atlas 2000 的起订量是多少？" }] }) });
  const chatText = await chatResponse.text();
  if (!chatResponse.ok || chatText.length < 10) throw new Error(`DeepSeek chat failed: ${chatResponse.status} ${chatText}`);

  const intentResponse = await fetch(`${baseUrl}/api/buyer-intent`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Workflow Verification", email, company: "Verification Import Ltd", country: "Germany", phone: "", productId: product.id, quantity: Math.max(product.moq, 100), timeline: "one-to-three", budgetStatus: "estimated", decisionRole: "influencer", targetPrice: "", destination: "Hamburg", incoterm: "FOB", requirements: "Need standard export packaging and compliance documents for internal review.", language: "en", website: "" }) });
  const intent = await intentResponse.json() as { inquiryNo?: string; level?: string; score?: number; error?: string };
  if (!intentResponse.ok || !intent.inquiryNo) throw new Error(`Buyer intent failed: ${intentResponse.status} ${JSON.stringify(intent)}`);

  const lookupResponse = await fetch(`${baseUrl}/api/inquiry-status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ inquiryNo: intent.inquiryNo, email, language: "en" }) });
  const lookup = await lookupResponse.json() as { status?: string; events?: unknown[]; error?: string };
  if (!lookupResponse.ok || !lookup.events?.length) throw new Error(`Follow-up lookup failed: ${lookupResponse.status} ${JSON.stringify(lookup)}`);

  console.log(JSON.stringify({ deepseek: { status: chatResponse.status, replyChars: chatText.length }, buyerIntent: { status: intentResponse.status, level: intent.level, score: intent.score }, followUp: { status: lookupResponse.status, inquiryStatus: lookup.status, eventCount: lookup.events.length } }, null, 2));
}

async function cleanup() {
  const customer = await db.customer.findUnique({ where: { email }, select: { id: true } });
  if (!customer) return;
  await db.inquiry.deleteMany({ where: { customerId: customer.id } });
  await db.conversation.deleteMany({ where: { customerId: customer.id } });
  await db.customer.delete({ where: { id: customer.id } });
}

main().finally(async () => {
  await cleanup();
  await db.$disconnect();
});
