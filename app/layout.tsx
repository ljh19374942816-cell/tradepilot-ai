import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradePilot AI | Global sourcing, intelligently handled",
  description: "AI-powered export inquiry, product consultation and customer management system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
