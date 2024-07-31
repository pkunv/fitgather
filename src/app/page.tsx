import { TypographyLead } from "@/app/_components/ui/typography";
import { api } from "@/trpc/server";
import Image from "next/image";

export default async function Home() {
  const user = await api.user.get();
  return (
    <>
      {user !== null && (
        <>
          <TypographyLead>
            Welcome {user.fullname}. Your username: {user.username}
          </TypographyLead>
          <Image
            src={user.picture ?? "/user.svg"}
            alt={`${user.fullname} profile picture`}
            width={24}
            height={24}
            className="rounded-full"
          />
        </>
      )}
    </>
  );
}
