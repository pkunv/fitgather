import { HowItWorks } from "@/app/about/how-it-works";
import { AppLogo } from "@/components/header/app-logo";
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from "@/components/ui/typography";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About  - Your Personal Outfit Collection Tool",
  description:
    "Discover how FitGather helps you create and visualize outfits from multiple online stores before making a purchase decision.",
};

export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <section className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <TypographyH1>Welcome to</TypographyH1>
            <AppLogo />
          </div>

          <div className="text-lg text-muted-foreground">
            <TypographyP>
              Your personal fashion curator for creating perfect outfits from
              anywhere on the web
            </TypographyP>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <TypographyH2>The story</TypographyH2>
        <TypographyP>
          fitgather was born from a simple yet common challenge: the desire to
          visualize how different clothing pieces from various websites would
          look together as a complete outfit. I wanted to create a tool that
          would help fashion enthusiasts make more informed decisions about
          their purchases by seeing the complete picture before committing, and
          also share their best finds and fits that are appealing.
        </TypographyP>
      </section>

      <section className="space-y-4">
        <TypographyH2>Seamless usage</TypographyH2>
        <TypographyP>
          Web app uses a helping hand from AI to analyze and extract product
          information from various e-commerce websites. While each online store
          has its unique structure and metadata format, I developed several
          functionalities that handle these differences and provide you with a
          seamless experience.
        </TypographyP>
        <TypographyP>
          I am going to continue working on this project to expand its
          compatibility with more online stores and improve the accuracy of
          product information extraction.
        </TypographyP>
      </section>

      <section className="space-y-4">
        <TypographyH2>Open source</TypographyH2>
        <TypographyP>
          fitgather is an open-source project, if you wish to get a look into
          how web scraping was done, feel free to check it out or submit
          contributions.
        </TypographyP>
      </section>

      <HowItWorks />
    </div>
  );
}
