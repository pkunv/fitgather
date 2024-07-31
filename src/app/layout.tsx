import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Header } from "@/app/_components/header/header";
import { Toaster } from "@/app/_components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    template: "%s / fitgather",
    default: "fitgather",
  },
  alternates: {
    canonical: "/",
  },
  description: "Web app for creating best outfits.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    siteName: "fitgather",
    url: new URL(`https://${process.env.VERCEL_URL}`),
  },
} as Metadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} antialiased`}>
      <body>
        <TRPCReactProvider>
          <Toaster />
          <div className="max-w-screen flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 py-6">
              {children}
            </main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
