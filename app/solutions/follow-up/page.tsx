import { getSession } from "@/lib/auth";
import { FollowUpExperience } from "@/components/solutions/follow-up-experience";

export default async function FollowUpPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const [{ lang }, session] = await Promise.all([searchParams, getSession()]);
  return <FollowUpExperience initialLanguage={lang === "zh" ? "zh" : "en"} isAdmin={Boolean(session)} />;
}
