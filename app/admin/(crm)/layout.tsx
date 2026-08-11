import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Globe2, Inbox, LogOut, Settings, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";
import { AdminLanguageToggle } from "@/components/admin/admin-language-toggle";
import { getAdminLocale, pick } from "@/lib/admin-i18n";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const [session, locale] = await Promise.all([getSession(), getAdminLocale()]); if (!session) redirect("/admin/login");
  return <div className="min-h-screen bg-[#f3f6f4] lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="hidden min-h-screen flex-col bg-[#073c2c] p-5 text-white lg:flex"><div className="flex items-center justify-between"><BrandMark light /></div><nav className="mt-10 grid gap-1"><Nav href="/admin" icon={BarChart3}>{pick(locale, "Overview", "概览")}</Nav><Nav href="/admin/inquiries" icon={Inbox}>{pick(locale, "Inquiries", "询盘")}</Nav><Nav href="/admin/customers" icon={Users}>{pick(locale, "Customers", "客户")}</Nav><Nav href="/admin/settings" icon={Settings}>{pick(locale, "Settings", "设置")}</Nav><Nav href={`/?lang=${locale}`} icon={Globe2}>{pick(locale, "Public website", "返回公开网站")}</Nav></nav><div className="mt-auto border-t border-white/10 pt-5"><div className="mb-4 px-3"><div className="text-xs font-bold">{session.name}</div><div className="mt-1 truncate text-[11px] text-white/50">{session.email}</div></div><div className="mb-2 px-3"><AdminLanguageToggle locale={locale} light /></div><form action="/api/auth/logout" method="post"><button className="flex w-full items-center gap-3 rounded-[5px] px-3 py-2.5 text-xs font-bold text-white/65 hover:bg-white/10 hover:text-white"><LogOut size={16} />{pick(locale, "Sign out", "退出登录")}</button></form></div></aside>
    <div><header className="flex h-16 items-center justify-between border-b border-[#dde5e0] bg-white px-4 lg:hidden"><BrandMark /><div className="flex items-center gap-2"><Link href={`/?lang=${locale}`} aria-label={pick(locale, "Public website", "返回公开网站")} title={pick(locale, "Public website", "返回公开网站")} className="grid size-9 place-items-center rounded-[5px] border border-[#d1dbd6] text-[#4f5d56]"><Globe2 size={17} /></Link><AdminLanguageToggle locale={locale} /><form action="/api/auth/logout" method="post"><button aria-label={pick(locale, "Sign out", "退出登录")}><LogOut size={18} /></button></form></div></header>{children}</div>
  </div>;
}

function Nav({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode }) { return <Link href={href} className="flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-xs font-bold text-white/65 transition hover:bg-white/10 hover:text-white"><Icon size={16} />{children}</Link>; }
