// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ChatBottombarWrapper from "@/components/chat/chat-bottombar"; // Client wrapper
import "./globals.css";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Metadata for the site
export const metadata: Metadata = {
  title: {
    default: "Chris Heher ",
    template: "%s | Chris Heher Portfolio",
  },
  description:
    "Professional portfolio of Chris Heher",
  authors: [{ name: "Chris Heher", url: "https://onlychr.is" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onlychr.is",
    title: "Chris Heher - Full-stack Developer Portfolio",
    description: "Portfolio showcasing conversational design.",
    siteName: "Chris Heher Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <main className="flex min-h-screen flex-col">
            {children}
          </main>
          <Toaster />
          <Analytics />
        </ThemeProvider>

      </body>
    </html>
  );
}
