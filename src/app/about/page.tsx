import { HowItWorks } from "@/app/about/how-it-works";
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from "@/components/ui/typography";

export default function About() {
  return (
    <>
      <TypographyH1>About</TypographyH1>
      <TypographyP>
        I created this app because I wanted to gather an outfit from various
        websites. I wanted to see how the outfit would look like and how much it
        would cost before buying.
      </TypographyP>
      <TypographyH2>Obstacles</TypographyH2>
      <TypographyP>
        The way this app works is by searching special metadata in the website
        that you submit. This is not always easy because E-Commerce shops have
        different engines, metadata structures and even region differences. This
        means that the app may not work with all websites.
      </TypographyP>
      <TypographyP>
        I will try to make it work with as many as possible. At some point I
        want to integrate AI to find this metadata automatically if given shop
        is not officially supported.
      </TypographyP>
      <HowItWorks />
    </>
  );
}
