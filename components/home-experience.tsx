"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BadgeCheck, Check, ChevronRight, Factory, Globe2, Languages, Menu, PackageCheck, Ship, Sparkles, Timer, X, Zap } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { ChatWidget } from "@/components/chat-widget";
import { formatMoney } from "@/lib/utils";

type Product = { id: string; slug: string; nameEn: string; nameZh: string; category: string; summaryEn: string; summaryZh: string; description: string; priceMin: number; moq: number; leadTime: string; imageUrl: string; specs: Record<string, string> };

const copy = {
  en: { nav: ["Products", "How it works", "Capabilities"], login: "CRM Login", badge: "AI-native export desk · Available 24/7", h1a: "Global sourcing,", h1b: "intelligently handled.", intro: "From the first product question to a qualified RFQ, TradePilot helps international buyers move faster with verified product data and a real export team behind every conversation.", cta: "Start an inquiry", explore: "Explore products", trusted: "Built for serious B2B purchasing", featured: "Sourcing shortlist", title: "Export-ready products, clear commercial terms.", desc: "Compare essential specifications, MOQs and lead times before you speak to sales.", how: "A shorter path from question to quotation", howDesc: "Our AI answers from live product data, captures buying intent and gives your request to the right export specialist.", footer: "AI-powered export inquiry and customer operations." },
  zh: { nav: ["产品中心", "询盘流程", "出口能力"], login: "CRM 登录", badge: "AI 原生外贸工作台 · 全天候在线", h1a: "让全球采购，", h1b: "更聪明、更高效。", intro: "从首个产品问题到高质量询盘，TradePilot 通过可信产品数据与专业出口团队，帮助全球买家缩短采购决策周期。", cta: "发起询盘", explore: "查看产品", trusted: "专为专业 B2B 采购打造", featured: "精选产品", title: "出口级产品，透明的商务条件。", desc: "在联系销售前，即可了解核心参数、起订量和交期。", how: "从问题到报价，路径更短", howDesc: "AI 基于真实产品数据回答，自动识别采购意向，并将需求交给合适的出口顾问。", footer: "AI 驱动的外贸询盘与客户运营系统。" },
};

export function HomeExperience({ products, isAdmin, initialLanguage }: { products: Product[]; isAdmin: boolean; initialLanguage: "en" | "zh" }) {
  const [language, setLanguage] = useState<"en" | "zh">(initialLanguage);
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<string>();
  const [menu, setMenu] = useState(false);
  const t = copy[language]; const zh = language === "zh";
  const inquire = (id?: string) => { setSelected(id); setDialog(true); };

  return <main className="overflow-hidden">
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15 text-white">
      <div className="shell flex h-[74px] items-center justify-between"><BrandMark light /><nav className="hidden items-center gap-7 lg:flex">{t.nav.map((item, i) => <a href={["#products", "#process", "#capabilities"][i]} key={item} className="text-[13px] font-bold text-white/80 transition hover:text-white">{item}</a>)}</nav><div className="flex items-center gap-2"><button onClick={() => setLanguage(zh ? "en" : "zh")} className="hidden h-9 items-center gap-2 rounded-[5px] border border-white/25 px-3 text-xs font-bold hover:bg-white/10 sm:flex"><Languages size={15} />{zh ? "EN" : "中文"}</button><Button asChild variant="accent" size="sm" className="hidden sm:inline-flex"><Link href={isAdmin ? "/admin" : "/admin/login"}>{isAdmin ? (zh ? "进入管理后台" : "Open dashboard") : t.login}</Link></Button><button className="grid size-10 place-items-center lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button></div></div>
      <AnimatePresence>{menu && <motion.nav initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-[#073c2c] lg:hidden"><div className="shell grid gap-1 py-4">{t.nav.map((item, i) => <a onClick={() => setMenu(false)} href={["#products", "#process", "#capabilities"][i]} key={item} className="py-3 text-sm font-bold">{item}</a>)}<button onClick={() => setLanguage(zh ? "en" : "zh")} className="flex items-center gap-2 py-3 text-left text-sm font-bold"><Languages size={16} />{zh ? "English" : "中文"}</button></div></motion.nav>}</AnimatePresence>
    </header>

    <section className="relative min-h-[760px] bg-[#073c2c] text-white lg:min-h-[820px]">
      <Image src="/images/hero-logistics.jpg" alt="International cargo ship and global logistics operation" fill priority className="object-cover object-center opacity-45" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,42,30,.98)_0%,rgba(4,42,30,.88)_40%,rgba(4,42,30,.18)_100%)]" />
      <div className="shell relative flex min-h-[760px] items-center pb-24 pt-32 lg:min-h-[820px]"><div className="max-w-[750px]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-[#e9f3ee] backdrop-blur"><Sparkles size={14} className="text-[#d8f06d]" />{t.badge}</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="display text-[clamp(48px,7vw,92px)] leading-[.98]">{t.h1a}<br /><em className="text-[#d8f06d]">{t.h1b}</em></motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-7 max-w-2xl text-[16px] leading-7 text-[#d2dfda] sm:text-lg">{t.intro}</motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-9 flex flex-wrap gap-3"><Button variant="accent" size="lg" onClick={() => inquire()}>{t.cta}<ArrowRight size={17} /></Button><Button asChild variant="outline" size="lg" className="border-white/35 bg-white/5 text-white hover:bg-white hover:text-[#073c2c]"><a href="#products">{t.explore}</a></Button></motion.div>
        <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-bold text-white/65"><span>{t.trusted}</span>{["ISO 9001", "CE / FCC", "Global logistics"].map((x) => <span key={x} className="flex items-center gap-1.5"><Check size={13} className="text-[#d8f06d]" />{x}</span>)}</div>
      </div></div>
      <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-[#062f23]/85 backdrop-blur-md"><div className="shell grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">{[["28+", zh ? "出口市场" : "Export markets"], ["< 2 min", zh ? "AI 首次响应" : "AI first response"], ["98.6%", zh ? "准时交付" : "On-time delivery"], ["12 yrs", zh ? "出口经验" : "Export experience"]].map(([a,b]) => <div key={b} className="px-3 py-5 sm:px-6"><div className="display text-2xl text-[#d8f06d] sm:text-3xl">{a}</div><div className="mt-1 text-[11px] font-bold text-white/55">{b}</div></div>)}</div></div>
    </section>

    <section id="products" className="py-20 sm:py-28"><div className="shell"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="eyebrow">{t.featured}</span><h2 className="display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">{t.title}</h2></div><p className="max-w-md text-sm leading-6 text-[#68756f]">{t.desc}</p></div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">{products.map((p, index) => <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * .08 }} key={p.id} className="group overflow-hidden rounded-[8px] border border-[#dfe6e2] bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9efec]"><Image src={p.imageUrl} alt={p.nameEn} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width:1024px) 100vw, 33vw" /><span className="absolute left-4 top-4 rounded-[4px] bg-white/95 px-2.5 py-1.5 text-[10px] font-black uppercase text-[#0b5d43]">{p.category}</span></div>
        <div className="p-5"><h3 className="display text-[23px] leading-tight">{zh ? p.nameZh : p.nameEn}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#6b7772]">{zh ? p.summaryZh : p.summaryEn}</p><div className="mt-5 grid grid-cols-3 border-y border-[#e6ebe8] py-4 text-xs"><div><span className="block text-[#88938e]">{zh ? "起订量" : "MOQ"}</span><b className="mt-1 block">{p.moq} units</b></div><div><span className="block text-[#88938e]">{zh ? "交期" : "Lead time"}</span><b className="mt-1 block">{p.leadTime.split(" ")[0]} days</b></div><div><span className="block text-[#88938e]">{zh ? "参考价" : "From"}</span><b className="mt-1 block text-[#0b5d43]">{formatMoney(p.priceMin)}</b></div></div><Button variant="ghost" className="mt-3 w-full justify-between px-0 hover:bg-transparent" onClick={() => inquire(p.id)}>{zh ? "获取报价" : "Request pricing"}<ChevronRight size={17} /></Button></div>
      </motion.article>)}</div>
    </div></section>

    <section id="process" className="bg-[#eff4f1] py-20 sm:py-28"><div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><span className="eyebrow">{zh ? "智能询盘" : "Intelligent inquiry"}</span><h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">{t.how}</h2><p className="mt-5 text-[15px] leading-7 text-[#68756f]">{t.howDesc}</p><Button className="mt-8" onClick={() => inquire()}>{t.cta}<ArrowRight size={17} /></Button></div><div className="grid gap-3">{[
        [MessageIcon, zh ? "全天候产品问答" : "24/7 product answers", zh ? "基于产品数据库回答参数、认证、MOQ 和交期。" : "Answers specifications, certifications, MOQ and lead time from product data."],
        [Zap, zh ? "自动识别采购意向" : "Automatic buyer qualification", zh ? "结构化收集数量、目标价、目的港和贸易术语。" : "Captures quantity, target price, destination and incoterms in a structured RFQ."],
        [Timer, zh ? "销售及时跟进" : "Sales follow-up, on time", zh ? "客户收到确认邮件，销售同步获得通知与跟进任务。" : "Buyers receive confirmation while sales gets an alert and a CRM follow-up task."],
      ].map(([Icon,title,desc], i) => <Link href={`${["/solutions/product-qa", "/solutions/buyer-intent", "/solutions/follow-up"][i]}?lang=${language}`} key={String(title)} className="surface group flex gap-4 p-5 transition hover:-translate-y-0.5 hover:border-[#0b5d43] hover:shadow-[0_12px_30px_rgba(7,60,44,.08)] sm:p-6"><span className="grid size-11 shrink-0 place-items-center rounded-[6px] bg-[#e4f0ea] text-[#0b5d43]"><Icon size={20} /></span><div className="min-w-0 flex-1"><div className="mb-1 text-[11px] font-black text-[#f27c5a]">0{i+1}</div><h3 className="flex items-center justify-between gap-3 font-bold">{title as string}<ChevronRight className="shrink-0 transition group-hover:translate-x-1" size={17} /></h3><p className="mt-1.5 text-sm leading-6 text-[#6b7772]">{desc as string}</p></div></Link>)}</div></div></section>

    <section id="capabilities" className="bg-[#073c2c] py-20 text-white sm:py-24"><div className="shell"><div className="grid gap-10 lg:grid-cols-2"><div><span className="eyebrow !text-[#d8f06d]">{zh ? "出口能力" : "Export confidence"}</span><h2 className="display mt-4 max-w-xl text-4xl leading-tight sm:text-5xl">{zh ? "从工厂到目的港，每一步都更清晰。" : "Clarity at every step, from factory to destination."}</h2></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-white/15">{[[Factory, zh ? "工厂审核" : "Factory audit"], [BadgeCheck, zh ? "认证支持" : "Certification"], [PackageCheck, zh ? "定制包装" : "Custom packaging"], [Ship, zh ? "全球物流" : "Global logistics"]].map(([Icon,x]) => <div key={String(x)} className="bg-[#0a4534] p-5 sm:p-7"><Icon className="mb-7 text-[#d8f06d]" size={23} /><div className="text-sm font-bold">{x as string}</div></div>)}</div></div></div></section>

    <footer className="bg-[#052d21] py-10 text-white/65"><div className="shell flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><BrandMark light /><p className="text-xs">{t.footer}</p><div className="flex gap-5 text-xs"><a href="mailto:sales@example.com">sales@example.com</a><Link href={isAdmin ? "/admin" : "/admin/login"}>{isAdmin ? (zh ? "管理后台" : "Dashboard") : "CRM"}</Link></div></div></footer>
    <InquiryDialog open={dialog} onOpenChange={setDialog} products={products} selectedId={selected} language={language} />
    <ChatWidget key={language} language={language} />
  </main>;
}

function MessageIcon(props: React.ComponentProps<typeof Globe2>) { return <Globe2 {...props} />; }
