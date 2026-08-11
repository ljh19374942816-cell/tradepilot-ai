import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/brand-mark";
import { AdminLanguageToggle } from "@/components/admin/admin-language-toggle";
import { getAdminLocale, pick } from "@/lib/admin-i18n";

export default async function LoginPage() {
  const [session, locale] = await Promise.all([getSession(), getAdminLocale()]);
  if (session) redirect("/admin");
  return <main className="grid min-h-screen bg-[#f2f5f3] lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-[#073c2c] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "url(/images/hero-logistics.jpg)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,60,44,.25),rgba(7,60,44,.96))]" />
      <div className="relative"><BrandMark light /></div><div className="relative max-w-xl"><span className="eyebrow !text-[#d8f06d]">{pick(locale, "Sales operations", "销售运营")}</span><h1 className="display mt-5 text-6xl leading-[1.02]">{pick(locale, "Turn every buying signal into the next best action.", "把每一个采购信号，转化为明确的销售行动。")}</h1><p className="mt-6 max-w-md text-sm leading-7 text-white/65">{pick(locale, "One workspace for inquiries, buyer context, email delivery and disciplined follow-up.", "在一个工作台中管理询盘、客户信息、邮件与销售跟进。")}</p></div>
    </section>
    <section className="relative flex items-center justify-center p-6"><div className="absolute right-6 top-6"><AdminLanguageToggle locale={locale} /></div><div className="w-full max-w-[420px]"><div className="mb-10 lg:hidden"><BrandMark /></div><div className="mb-8"><p className="text-xs font-black uppercase text-[#0b5d43]">{pick(locale, "Secure workspace", "安全工作台")}</p><h2 className="display mt-3 text-4xl">{pick(locale, "Welcome back", "欢迎回来")}</h2><p className="mt-2 text-sm text-[#6d7973]">{pick(locale, "Sign in to manage inquiries and customer follow-ups.", "登录后管理询盘与客户跟进。")}</p></div><LoginForm locale={locale} /><p className="mt-8 text-center text-xs text-[#89948f]">{pick(locale, "Protected by encrypted HttpOnly sessions", "使用加密 HttpOnly 会话保护")}</p></div></section>
  </main>;
}
