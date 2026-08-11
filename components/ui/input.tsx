import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-[6px] border border-[#d6dfda] bg-white px-3 text-sm outline-none transition focus:border-[#0b5d43] focus:ring-2 focus:ring-[#0b5d43]/10 placeholder:text-[#9aa49f]", className)} {...props} />;
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full resize-y rounded-[6px] border border-[#d6dfda] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#0b5d43] focus:ring-2 focus:ring-[#0b5d43]/10 placeholder:text-[#9aa49f]", className)} {...props} />;
}
