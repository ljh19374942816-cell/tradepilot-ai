import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { BuyerIntentExperience } from "@/components/solutions/buyer-intent-experience";

export const dynamic = "force-dynamic";

export default async function BuyerIntentPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const [{ lang }, session, products] = await Promise.all([searchParams, getSession(), db.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" }, select: { id: true, nameEn: true, nameZh: true, moq: true } })]);
  return <BuyerIntentExperience initialLanguage={lang === "zh" ? "zh" : "en"} isAdmin={Boolean(session)} products={products} />;
}
