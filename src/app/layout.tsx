import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

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
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
