import { db } from "@/lib/db";
import { HomeExperience } from "@/components/home-experience";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const [{ lang }, session] = await Promise.all([searchParams, getSession()]);
  const products = await db.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return <HomeExperience initialLanguage={lang === "zh" ? "zh" : "en"} isAdmin={Boolean(session)} products={products.map((p) => ({ ...p, specs: p.specs as Record<string, string> }))} />;
}
