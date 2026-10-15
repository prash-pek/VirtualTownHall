import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { Disclaimer } from "@/components/disclaimer";
import { SiteHeader } from "@/components/site-header";
import { afterAuthUrl, signInUrl, signUpUrl } from "@/lib/auth/urls";
import { clerkEnabled } from "@/lib/env";

import "@fontsource-variable/dm-sans";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TownHall AI",
  description:
    "Get ready to fill out your Oregon ballot for November 3, 2026: walk through every race and measure, with sources for everything we show.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-cream font-sans text-ink antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <Disclaimer />
      </body>
    </html>
  );
  return clerkEnabled() ? (
    <ClerkProvider
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={afterAuthUrl}
      signUpFallbackRedirectUrl={afterAuthUrl}
    >
      {body}
    </ClerkProvider>
  ) : (
    body
  );
}
