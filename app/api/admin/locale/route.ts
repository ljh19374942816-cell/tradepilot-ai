import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminLocaleSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = adminLocaleSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  (await cookies()).set("tradepilot_admin_locale", parsed.data.locale, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return NextResponse.json({ ok: true });
}
