"use client";

import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminLocale } from "@/lib/admin-i18n";

export function LoginForm({ locale }: { locale: AdminLocale }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(formData: FormData) { setLoading(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData.entries())) }); const result = await response.json(); if (!response.ok) { setError(result.error); setLoading(false); return; } router.push("/admin"); router.refresh(); }
  const zh = locale === "zh";
  return <form action={submit} className="space-y-5"><label className="grid gap-2 text-xs font-bold text-[#44514b]">{zh ? "邮箱地址" : "Email address"}<Input name="email" type="email" required placeholder="admin@tradepilot.local" autoComplete="email" /></label><label className="grid gap-2 text-xs font-bold text-[#44514b]">{zh ? "密码" : "Password"}<Input name="password" type="password" required minLength={8} placeholder={zh ? "输入密码" : "Enter your password"} autoComplete="current-password" /></label>{error && <p className="rounded-[5px] bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="w-full" size="lg" disabled={loading}>{loading ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}{zh ? "登录" : "Sign in"}</Button></form>;
}
