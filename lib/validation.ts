import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  company: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  country: z.string().trim().min(2).max(80),
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive().max(10_000_000),
  targetPrice: z.coerce.number().positive().max(10_000_000).optional().or(z.literal("")),
  destination: z.string().trim().max(120).optional().default(""),
  incoterm: z.enum(["EXW", "FOB", "CIF", "DDP", "Not sure"]),
  message: z.string().trim().min(10).max(4000),
  language: z.enum(["en", "zh"]),
  website: z.string().max(0).optional(),
});

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });

export const chatSchema = z.object({
  sessionId: z.string().uuid(),
  language: z.enum(["en", "zh"]),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(20),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST"]).optional(),
  assignedTo: z.string().max(80).nullable().optional(),
  nextFollowUp: z.string().datetime().nullable().optional(),
  note: z.string().trim().min(2).max(2000).optional(),
});

export const buyerIntentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  company: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(40).optional().default(""),
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive().max(10_000_000),
  timeline: z.enum(["within-30", "one-to-three", "three-to-six", "researching"]),
  budgetStatus: z.enum(["approved", "estimated", "unknown"]),
  decisionRole: z.enum(["decision-maker", "influencer", "researcher"]),
  targetPrice: z.coerce.number().positive().max(10_000_000).optional().or(z.literal("")),
  destination: z.string().trim().min(2).max(120),
  incoterm: z.enum(["EXW", "FOB", "CIF", "DDP", "Not sure"]),
  requirements: z.string().trim().min(10).max(4000),
  language: z.enum(["en", "zh"]),
  website: z.string().max(0).optional(),
});

export const inquiryLookupSchema = z.object({
  inquiryNo: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160),
  language: z.enum(["en", "zh"]).default("en"),
});

export const adminLocaleSchema = z.object({ locale: z.enum(["en", "zh"]) });
