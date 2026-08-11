import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ProductQaExperience } from "@/components/solutions/product-qa-experience";

export const dynamic = "force-dynamic";

export default async function ProductQaPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const [{ lang }, session, products] = await Promise.all([searchParams, getSession(), db.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } })]);
  return <ProductQaExperience initialLanguage={lang === "zh" ? "zh" : "en"} isAdmin={Boolean(session)} products={products.map((product) => ({ ...product, specs: product.specs as Record<string, string> }))} />;
}
