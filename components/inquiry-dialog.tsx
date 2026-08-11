"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, Loader2, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Product = { id: string; nameEn: string; nameZh: string; moq: number };

export function InquiryDialog({ open, onOpenChange, products, selectedId, language }: { open: boolean; onOpenChange: (v: boolean) => void; products: Product[]; selectedId?: string; language: "en" | "zh" }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [emailQueued, setEmailQueued] = useState(false);
  const zh = language === "zh";

  async function submit(formData: FormData) {
    setState("loading"); setMessage("");
    const body = Object.fromEntries(formData.entries());
    const response = await fetch("/api/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, language }) });
    const result = await response.json();
    if (!response.ok) { setState("error"); setMessage(result.error || "Submission failed"); return; }
    setReference(result.inquiryNo); setEmailQueued(Boolean(result.emailQueued)); setState("success");
  }

  return <Dialog.Root open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(() => setState("idle"), 200); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-[#071b14]/65 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(720px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[8px] bg-white shadow-2xl outline-none">
        <div className="border-b border-[#e2e8e4] px-6 py-5 sm:px-8">
          <Dialog.Title className="display text-2xl text-[#10221c]">{zh ? "获取专属报价" : "Request a tailored quote"}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[#6b7772]">{zh ? "请提供您的采购需求，出口顾问将在 1 个工作日内回复。" : "Share your buying requirements. An export specialist will reply within one business day."}</Dialog.Description>
          <Dialog.Close className="absolute right-5 top-5 grid size-9 place-items-center rounded-[5px] text-[#6b7772] hover:bg-[#f0f3f1]" aria-label="Close"><X size={18} /></Dialog.Close>
        </div>
        {state === "success" ? <div className="grid min-h-[430px] place-items-center p-8 text-center">
          <div><CheckCircle2 className="mx-auto mb-5 text-[#0b5d43]" size={52} /><h3 className="display text-3xl">{zh ? "询盘已成功提交" : "Inquiry received"}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68756f]">{emailQueued ? (zh ? "确认邮件已经发送。请保存您的询盘编号：" : "Your confirmation email has been sent. Keep this inquiry reference:") : (zh ? "询盘已保存。当前环境未配置邮件服务，请保存询盘编号：" : "Your inquiry is saved. Email is not configured in this environment; keep this reference:")}</p><div className="mx-auto my-6 w-fit rounded-[6px] bg-[#edf4f0] px-5 py-3 font-mono font-bold text-[#0b5d43]">{reference}</div><Button onClick={() => onOpenChange(false)}>{zh ? "完成" : "Done"}</Button></div>
        </div> : <form action={submit} className="p-6 sm:p-8">
          <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={zh ? "姓名 *" : "Full name *"}><Input required name="name" placeholder={zh ? "您的姓名" : "e.g. Maria Garcia"} /></Field>
            <Field label={zh ? "工作邮箱 *" : "Business email *"}><Input required type="email" name="email" placeholder="maria@company.com" /></Field>
            <Field label={zh ? "公司名称" : "Company"}><Input name="company" placeholder={zh ? "公司名称" : "Company name"} /></Field>
            <Field label={zh ? "国家/地区 *" : "Country / region *"}><Input required name="country" placeholder={zh ? "例如：德国" : "e.g. Germany"} /></Field>
            <Field label={zh ? "产品 *" : "Product *"}><select name="productId" defaultValue={selectedId || products[0]?.id} className="h-11 w-full rounded-[6px] border border-[#d6dfda] bg-white px-3 text-sm" required>{products.map((p) => <option value={p.id} key={p.id}>{zh ? p.nameZh : p.nameEn}</option>)}</select></Field>
            <Field label={zh ? "采购数量 *" : "Required quantity *"}><Input required name="quantity" type="number" min="1" placeholder="500" /></Field>
            <Field label={zh ? "目标单价（美元）" : "Target price (USD)"}><Input name="targetPrice" type="number" min="0" step="0.01" placeholder="Optional" /></Field>
            <Field label={zh ? "贸易术语" : "Preferred incoterm"}><select name="incoterm" defaultValue="FOB" className="h-11 w-full rounded-[6px] border border-[#d6dfda] bg-white px-3 text-sm"><option>EXW</option><option>FOB</option><option>CIF</option><option>DDP</option><option>Not sure</option></select></Field>
            <Field label={zh ? "目的港/城市" : "Destination port / city"}><Input name="destination" placeholder={zh ? "例如：汉堡港" : "e.g. Port of Hamburg"} /></Field>
            <Field label={zh ? "电话 / WhatsApp" : "Phone / WhatsApp"}><Input name="phone" placeholder="+49 ..." /></Field>
            <div className="sm:col-span-2"><Field label={zh ? "详细需求 *" : "Requirements *"}><Textarea required name="message" minLength={10} placeholder={zh ? "请说明规格、认证、包装和交付要求..." : "Tell us about specifications, certifications, packaging and delivery..."} /></Field></div>
          </div>
          {state === "error" && <p className="mt-4 rounded-[5px] bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
          <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#e6ebe8] pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-[#76827c]">{zh ? "提交即表示您同意我们根据隐私政策处理您的信息。" : "By submitting, you agree to our privacy policy."}</p>
            <Button disabled={state === "loading"} size="lg" className="shrink-0">{state === "loading" ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}{zh ? "提交询盘" : "Send inquiry"}</Button>
          </div>
        </form>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-bold text-[#44514b]">{label}{children}</label>;
}
