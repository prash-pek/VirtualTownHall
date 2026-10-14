import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { Disclaimer } from "@/components/disclaimer";
import { clerkEnabled } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  title: "TownHall AI",
  description:
    "See your exact Oregon ballot for November 3, 2026, with sourced information on every candidate and measure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en">
      <body className="min-h-dvh bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
        <Disclaimer />
      </body>
    </html>
  );
  return clerkEnabled() ? <ClerkProvider>{body}</ClerkProvider> : body;
}
