import { OutfitForm } from "@/components/outfit/outfit-form";
import { TypographyH1 } from "@/components/ui/typography";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <TypographyH1>Let&apos;s make an outfit!</TypographyH1>
      <OutfitForm user={user} action="create" />
    </>
  );
}
