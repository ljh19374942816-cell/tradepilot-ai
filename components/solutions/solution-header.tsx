"use client";

import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function SolutionHeader({ language, onLanguageChange, isAdmin }: { language: "en" | "zh"; onLanguageChange: (language: "en" | "zh") => void; isAdmin: boolean }) {
  const zh = language === "zh";
  return <header className="border-b border-[#dbe4df] bg-white/95 backdrop-blur">
    <div className="shell flex h-[72px] items-center justify-between gap-3">
      <div className="flex items-center gap-6"><BrandMark /><Link href={`/?lang=${language}`} className="hidden items-center gap-2 text-xs font-bold text-[#66736e] hover:text-[#0b5d43] sm:flex"><ArrowLeft size={15} />{zh ? "返回首页" : "Back to home"}</Link></div>
      <div className="flex items-center gap-2"><button onClick={() => onLanguageChange(zh ? "en" : "zh")} className="flex h-9 items-center gap-2 rounded-[5px] border border-[#d1dbd6] px-3 text-xs font-bold text-[#405049] hover:border-[#0b5d43]"><Languages size={15} />{zh ? "EN" : "中文"}</button><Button asChild size="sm"><Link href={isAdmin ? "/admin" : "/admin/login"}>{isAdmin ? (zh ? "管理后台" : "Dashboard") : (zh ? "CRM 登录" : "CRM login")}</Link></Button></div>
    </div>
  </header>;
}
