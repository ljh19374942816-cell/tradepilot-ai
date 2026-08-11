import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeInquiryNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TP-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
