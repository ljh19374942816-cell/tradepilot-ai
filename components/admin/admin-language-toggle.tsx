"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminLocale } from "@/lib/admin-i18n";

export function AdminLanguageToggle({ locale, light = false }: { locale: AdminLocale; light?: boolean }) {
  const [loading, setLoading] = useState(false); const router = useRouter();
  async function toggle() { setLoading(true); await fetch("/api/admin/locale", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locale: locale === "zh" ? "en" : "zh" }) }); router.refresh(); setLoading(false); }
  return <button onClick={toggle} disabled={loading} className={`flex h-9 items-center gap-2 rounded-[5px] border px-3 text-xs font-bold transition ${light ? "border-white/20 text-white/75 hover:bg-white/10" : "border-[#d1dbd6] text-[#4f5d56] hover:border-[#0b5d43]"}`}><Languages size={14} />{locale === "zh" ? "EN" : "中文"}</button>;
}
