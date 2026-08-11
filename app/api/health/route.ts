import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected", ai: Boolean(process.env.DEEPSEEK_API_KEY), aiProvider: "deepseek", email: Boolean(process.env.RESEND_API_KEY), timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error", database: "unavailable" }, { status: 503 });
  }
}
