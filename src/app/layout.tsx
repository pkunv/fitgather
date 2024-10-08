import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import Footer from "@/components/footer/_footer";
import { Header } from "@/components/header/_header";
import ModalSlot from "@/components/ui/modal-slot";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    template: "%s / fitgather",
    default: "Home / fitgather",
  },
  alternates: {
    canonical: "/",
  },
  description:
    "Web app for creating and sharing outfits using E-Commerce clothing websites.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    title: "fitgather",
    siteName: "fitgather",
    description:
      "Web app for creating and sharing outfits using E-Commerce clothing websites.",
    url: new URL(`https://${process.env.VERCEL_URL}`),
  },
} as Metadata;

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} antialiased`}>
      <body className="overflow-y-scroll">
        <TRPCReactProvider>
          <SpeedInsights />
          <Toaster />
          <ModalSlot>{modal}</ModalSlot>
          <div className="flex min-h-screen w-screen max-w-full flex-col">
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
