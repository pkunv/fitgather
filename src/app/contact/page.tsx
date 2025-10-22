import { Card } from "@/components/ui/card";
import { TypographyH1 } from "@/components/ui/typography";
import { Github, Mail } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <TypographyH1 className="mb-8 text-center">Get in Touch</TypographyH1>

        <div className="grid gap-6">
          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-semibold">Email</h2>
                <Link
                  href="mailto:kuncypiotr@gmail.com"
                  className="text-primary hover:underline"
                >
                  kuncypiotr@gmail.com
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Image
                  src="/icon-letter.svg"
                  alt="Personal Logo"
                  width={24}
                  height={24}
                  className="text-primary"
                />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-semibold">Website</h2>
                <Link
                  href="https://kunv.dev"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  kunv.dev
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-semibold">Github</h2>
                <div className="space-y-1">
                  <Link
                    href="https://github.com/pkunv"
                    target="_blank"
                    className="block text-primary hover:underline"
                  >
                    @pkunv
                  </Link>
                  <Link
                    href="https://github.com/pkunv/fitgather"
                    target="_blank"
                    className="block text-primary hover:underline"
                  >
                    fitgather repository
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <p className="mt-8 text-center text-muted-foreground">
          Feel free to reach out! I&apos;ll get back to you as soon as possible.
        </p>
      </div>
    </div>
  );
}
