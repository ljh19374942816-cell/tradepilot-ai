import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { inquiryUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = inquiryUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid update" }, { status: 400 });
  const { id } = await params; const { note, nextFollowUp, ...fields } = parsed.data;
  const hasPublicUpdate = fields.status !== undefined || fields.assignedTo !== undefined || nextFollowUp !== undefined;
  const status = fields.status || "CONTACTED";
  const inquiry = await db.inquiry.update({ where: { id }, data: { ...fields, ...(nextFollowUp !== undefined ? { nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null } : {}), ...(note ? { notes: { create: { author: session.name, content: note } } } : {}), ...(hasPublicUpdate ? { events: { create: { type: "STATUS_UPDATED", titleEn: "Inquiry progress updated", titleZh: "询盘进度已更新", descriptionEn: `The inquiry is now ${status.toLowerCase().replaceAll("_", " ")}.`, descriptionZh: `询盘当前状态：${status}。` } } } : {}) }, include: { notes: { orderBy: { createdAt: "desc" } } } });
  return NextResponse.json(inquiry);
}
