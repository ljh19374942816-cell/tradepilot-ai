import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [products, customers, inquiries, qualified, emailLogs] = await Promise.all([
    db.product.count(),
    db.customer.count(),
    db.inquiry.count(),
    db.inquiry.count({ where: { status: "QUALIFIED" } }),
    db.emailLog.count(),
  ]);
  console.log(JSON.stringify({ products, customers, inquiries, qualified, emailLogs }, null, 2));
}

main().finally(() => db.$disconnect());
