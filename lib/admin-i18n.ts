import { cookies } from "next/headers";

export type AdminLocale = "en" | "zh";

export async function getAdminLocale(): Promise<AdminLocale> {
  return (await cookies()).get("tradepilot_admin_locale")?.value === "zh" ? "zh" : "en";
}

export function pick(locale: AdminLocale, en: string, zh: string) {
  return locale === "zh" ? zh : en;
}

export const statusText: Record<AdminLocale, Record<string, string>> = {
  en: { NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified", QUOTED: "Quoted", WON: "Won", LOST: "Lost" },
  zh: { NEW: "新询盘", CONTACTED: "已联系", QUALIFIED: "已确认", QUOTED: "已报价", WON: "已成交", LOST: "已结束" },
};
