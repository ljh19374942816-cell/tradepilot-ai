import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(requestKey(request, "login"), 10, 15 * 60 * 1000).allowed) return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const admin = await db.admin.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect" }, { status: 401 });
  await createSession(admin);
  return NextResponse.json({ ok: true });
}
