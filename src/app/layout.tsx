import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import Footer from "@/components/footer/_footer";
import { Header } from "@/components/header/_header";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    template: "%s / fitgather",
    default: "Home / fitgather",
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
            <main className="mx-auto flex min-h-[65svh] w-full max-w-6xl flex-col items-center justify-start gap-6 px-6 py-6 sm:px-0">
              {children}
            </main>
            <Footer />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
